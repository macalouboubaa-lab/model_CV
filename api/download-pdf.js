const fs = require('fs/promises');
const path = require('path');
const chromium = require('@sparticuz/chromium').default;
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');
const sanitizeHtml = require('sanitize-html');
const { prepareModelHtml } = require('../lib/model-template');
const {
  adminRequest,
  getAuthenticatedUser,
  isAdmin,
  isModelId,
  parseBody,
  sendJson
} = require('../lib/supabase-api');

const MAX_HTML_BYTES = 4 * 1024 * 1024;
const PLACEHOLDER_IMAGE = '/assets/placeholder-photo.jpg';

function sanitizeCvHtml(html, placeholderDataUrl) {
  return sanitizeHtml(html, {
    allowedTags: [
      'a', 'aside', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'header',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'section', 'small', 'span', 'strong',
      'sub', 'sup', 'u', 'ul'
    ],
    allowedAttributes: {
      '*': ['class', 'contenteditable', 'data-editable'],
      a: ['href', 'class'],
      img: ['src', 'alt', 'class', 'width', 'height']
    },
    allowedClasses: { '*': [/^[a-zA-Z0-9_-]+$/] },
    allowedSchemes: ['https', 'mailto'],
    allowedSchemesByTag: { img: ['data'] },
    allowProtocolRelative: false,
    nonTextTags: [
      'script', 'style', 'textarea', 'option', 'noscript', 'noembed',
      'noframes', 'iframe', 'object', 'svg', 'math'
    ],
    exclusiveFilter: (frame) =>
      frame.tag === 'button' || (frame.attribs.class || '').split(/\s+/).includes('no-print'),
    transformTags: {
      img: (_tagName, attributes) => {
        const src = attributes.src || '';
        const validDataImage = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(src) &&
          src.length <= MAX_HTML_BYTES;
        const isPlaceholder = src === PLACEHOLDER_IMAGE || src === PLACEHOLDER_IMAGE.slice(1);
        const safeSrc = isPlaceholder ? placeholderDataUrl : validDataImage ? src : '';
        const safeAttributes = { alt: attributes.alt || '' };
        if (safeSrc) safeAttributes.src = safeSrc;
        if (attributes.class) safeAttributes.class = attributes.class;
        if (attributes.width && /^\d{1,4}$/.test(attributes.width)) safeAttributes.width = attributes.width;
        if (attributes.height && /^\d{1,4}$/.test(attributes.height)) safeAttributes.height = attributes.height;
        return { tagName: 'img', attribs: safeAttributes };
      }
    }
  });
}

async function verifyEntitlement(auth, modelId) {
  if (isAdmin(auth.user)) return;
  const rows = await adminRequest(
    `/rest/v1/entitlements?select=model_id&user_id=eq.${encodeURIComponent(auth.user.id)}&model_id=eq.${encodeURIComponent(modelId)}&limit=1`
  );
  if (rows.length !== 1) {
    const error = new Error('Aucun droit d’accès actif pour ce modèle.');
    error.statusCode = 403;
    throw error;
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  let browser;
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user?.id) return sendJson(response, 401, { error: 'Connectez-vous pour télécharger ce PDF.' });

    const body = await parseBody(request, MAX_HTML_BYTES + 1024);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(response, 400, { error: 'Le contenu de la requête est invalide.' });
    }
    const { modelId, html } = body;
    if (!isModelId(modelId) || typeof html !== 'string' || !html.trim()) {
      return sendJson(response, 400, { error: 'Modèle ou contenu de CV invalide.' });
    }
    if (Buffer.byteLength(html) > MAX_HTML_BYTES) {
      return sendJson(response, 413, { error: 'Le CV est trop volumineux. Réduisez la taille de la photo avant de réessayer.' });
    }
    await verifyEntitlement(auth, modelId);

    const templatePath = path.join(process.cwd(), `${modelId}.html`);
    const placeholderPath = path.join(process.cwd(), 'assets', 'placeholder-photo.jpg');
    const [template, placeholder] = await Promise.all([
      fs.readFile(templatePath, 'utf8'),
      fs.readFile(placeholderPath)
    ]);
    const $ = cheerio.load(prepareModelHtml(template));
    $('script, iframe, object, embed').remove();
    const cvContainer = $('#cvContainer');
    if (!cvContainer.length) {
      const error = new Error('Le conteneur du modèle est introuvable.');
      error.statusCode = 500;
      throw error;
    }
    const placeholderDataUrl = `data:image/jpeg;base64,${placeholder.toString('base64')}`;
    cvContainer.html(sanitizeCvHtml(html, placeholderDataUrl));
    $('.toolbar, #sama-watermark, #sama-banner, .sama-footer').remove();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    const page = await browser.newPage();
    await page.setContent($.html(), { waitUntil: 'networkidle0', timeout: 30_000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${modelId}.pdf"`);
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.end(pdf);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return sendJson(response, 404, { error: 'Ce modèle est introuvable.' });
    }
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('PDF generation failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 || statusCode === 400 || statusCode === 413 || statusCode === 403
        ? error.message
        : 'La génération du PDF a échoué.'
    });
  } finally {
    if (browser) await browser.close();
  }
};
