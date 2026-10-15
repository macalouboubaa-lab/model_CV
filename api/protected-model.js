const fs = require('fs/promises');
const path = require('path');
const {
  adminRequest,
  getAuthenticatedUser,
  isAdmin,
  isModelId,
  sendJson
} = require('../lib/supabase-api');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  const modelId = request.query?.model;
  if (!isModelId(modelId)) return sendJson(response, 400, { error: 'Modèle invalide.' });

  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user?.id) return sendJson(response, 401, { error: 'Connectez-vous pour accéder à ce modèle.' });

    if (!isAdmin(auth.user)) {
      const rows = await adminRequest(
        `/rest/v1/entitlements?select=model_id&user_id=eq.${encodeURIComponent(auth.user.id)}&model_id=eq.${encodeURIComponent(modelId)}&limit=1`
      );
      if (rows.length !== 1) {
        return sendJson(response, 403, { error: 'Aucun droit d’accès actif pour ce modèle.' });
      }
    }

    const templatePath = path.join(process.cwd(), `${modelId}.html`);
    const html = await fs.readFile(templatePath, 'utf8');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.end(html);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Protected model delivery failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 ? error.message : 'Le modèle n’a pas pu être chargé.'
    });
  }
};
