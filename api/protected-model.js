const fs = require('fs/promises');
const path = require('path');
const { prepareModelHtml } = require('../lib/model-template');
const { isModelId, sendJson } = require('../lib/supabase-api');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  const modelId = request.query?.model;
  if (!isModelId(modelId)) return sendJson(response, 400, { error: 'Modèle invalide.' });

  try {
    const templatePath = path.join(process.cwd(), `${modelId}.html`);
    const html = await fs.readFile(templatePath, 'utf8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=300');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.end(prepareModelHtml(html));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return sendJson(response, 404, { error: 'Ce modèle est introuvable.' });
    }
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Protected model delivery failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 ? error.message : 'Le modèle n’a pas pu être chargé.'
    });
  }
};
