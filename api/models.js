const fs = require('fs/promises');
const path = require('path');
const { isModelId, sendJson } = require('../lib/supabase-api');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  try {
    const files = await fs.readdir(process.cwd());
    const models = files
      .filter((file) => file.endsWith('.html'))
      .map((file) => file.slice(0, -5))
      .filter(isModelId)
      .sort((left, right) => Number(left.slice(5)) - Number(right.slice(5)));

    return sendJson(response, 200, { models });
  } catch (error) {
    console.error('Model catalog lookup failed:', error.message);
    return sendJson(response, 500, { error: 'Le catalogue des modèles est indisponible.' });
  }
};
