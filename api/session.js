const { getAuthenticatedUser, sendJson } = require('../lib/supabase-api');

const SESSION_COOKIE = 'sama_access_token';
const COOKIE_ATTRIBUTES = '; Path=/; HttpOnly; Secure; SameSite=Lax';

module.exports = async function handler(request, response) {
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    response.setHeader('Allow', 'POST, DELETE');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  if (request.method === 'DELETE') {
    response.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Max-Age=0${COOKIE_ATTRIBUTES}`);
    return sendJson(response, 200, { success: true });
  }

  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user?.id) return sendJson(response, 401, { error: 'Session Supabase invalide.' });

    response.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=${encodeURIComponent(auth.token)}; Max-Age=3600${COOKIE_ATTRIBUTES}`
    );
    return sendJson(response, 200, { success: true });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Session cookie synchronization failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 ? error.message : 'La synchronisation de session a échoué.'
    });
  }
};
