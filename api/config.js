const { getPublicConfig, getWavePaymentLink, sendJson } = require('../lib/supabase-api');

module.exports = function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  const config = getPublicConfig();
  if (!config) {
    return sendJson(response, 503, { error: 'Les variables publiques Supabase ne sont pas configurées.' });
  }
  return sendJson(response, 200, { ...config, ...getWavePaymentLink() });
};
