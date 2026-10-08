const {
  adminRequest,
  getAuthenticatedUser,
  sendJson,
  isModelId
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
    if (!auth?.user?.id) return sendJson(response, 401, { error: 'Session invalide.' });
    const rows = await adminRequest(
      `/rest/v1/entitlements?select=model_id&user_id=eq.${encodeURIComponent(auth.user.id)}&model_id=eq.${encodeURIComponent(modelId)}&limit=1`
    );
    return sendJson(response, 200, {
      paid: rows.length === 1,
      modelId
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Entitlement lookup failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 ? error.message : 'La vérification du droit a échoué.'
    });
  }
};
