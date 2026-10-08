const MODEL_ID_PATTERN = /^model(?:[1-9]|1[0-4])$/;

function isPrivilegedKey(key) {
  if (key.startsWith('sb_secret_')) return true;
  const payload = key.split('.')[1];
  if (!payload) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).role === 'service_role';
  } catch (error) {
    return false;
  }
}

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

function getPublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';
  if (!supabaseUrl || !supabaseAnonKey || isPrivilegedKey(supabaseAnonKey)) return null;

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch (error) {
    return null;
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') return null;

  return { supabaseUrl: parsedUrl.origin, supabaseAnonKey };
}

function getWavePaymentLink() {
  let wavePaymentLink = process.env.NEXT_PUBLIC_WAVE_PAYMENT_LINK ||
    'https://pay.wave.com/m/M_sn_8v2_0CdTfZA3/c/sn/?amount=2000';
  if (wavePaymentLink) {
    try {
      const parsedWaveLink = new URL(wavePaymentLink);
      if (parsedWaveLink.protocol !== 'https:' || parsedWaveLink.hostname !== 'pay.wave.com') {
        return {
          wavePaymentLink: '',
          wavePaymentLinkError: 'Le lien Wave configuré doit utiliser le domaine sécurisé pay.wave.com.'
        };
      }
      wavePaymentLink = parsedWaveLink.toString();
    } catch (error) {
      return {
        wavePaymentLink: '',
        wavePaymentLinkError: 'Le lien Wave configuré n’est pas une URL valide.'
      };
    }
  }
  return { wavePaymentLink, wavePaymentLinkError: '' };
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    '';
}

async function parseBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      error.statusCode = 400;
      throw error;
    }
  }
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) {
      const error = new Error('La requête est trop volumineuse.');
      error.statusCode = 413;
      throw error;
    }
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer ([^\s]+)$/i);
  return match ? match[1] : '';
}

async function getAuthenticatedUser(request) {
  const config = getPublicConfig();
  const token = getBearerToken(request);
  if (!config) {
    const error = new Error('Les variables publiques Supabase ne sont pas configurées.');
    error.statusCode = 503;
    throw error;
  }
  if (!token) return null;

  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) return null;
  return { user: await response.json(), token, config };
}

async function adminRequest(path, options = {}) {
  const config = getPublicConfig();
  const serviceKey = getServiceKey();
  if (!config || !serviceKey) {
    const error = new Error('La configuration serveur Supabase est incomplète.');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || 'La requête serveur Supabase a échoué.');
    error.statusCode = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}

function isAdmin(user) {
  return user?.app_metadata?.role === 'admin';
}

function isModelId(value) {
  return typeof value === 'string' && MODEL_ID_PATTERN.test(value);
}

module.exports = {
  adminRequest,
  getAuthenticatedUser,
  getPublicConfig,
  getWavePaymentLink,
  isAdmin,
  isModelId,
  parseBody,
  sendJson
};
