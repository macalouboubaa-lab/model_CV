(function () {
  const SESSION_KEY = 'sama_session';
  let configPromise;

  window.SAMA_CV_CONFIG = window.SAMA_CV_CONFIG || {
    supabaseUrl: '',
    supabaseAnonKey: '',
    entitlementsEndpoint: '/api/entitlements',
    paymentSubmissionEndpoint: '/api/payments',
    adminPaymentsEndpoint: '/api/admin/payments'
  };

  async function getConfig() {
    const currentConfig = window.SAMA_CV_CONFIG;
    if (currentConfig.supabaseUrl && currentConfig.supabaseAnonKey) {
      return { ...currentConfig, supabaseUrl: currentConfig.supabaseUrl.replace(/\/$/, '') };
    }
    if (!configPromise) {
      configPromise = fetch('/api/config', { headers: { Accept: 'application/json' } })
        .then(async (response) => {
          const runtimeConfig = await response.json().catch(() => ({}));
          if (!response.ok || !runtimeConfig.supabaseUrl || !runtimeConfig.supabaseAnonKey) {
            throw new Error(runtimeConfig.error || 'Les variables publiques Supabase ne sont pas configurées.');
          }
          window.SAMA_CV_CONFIG = { ...currentConfig, ...runtimeConfig };
          return {
            ...window.SAMA_CV_CONFIG,
            supabaseUrl: runtimeConfig.supabaseUrl.replace(/\/$/, '')
          };
        });
    }
    return configPromise;
  }

  function readStoredSession() {
    try {
      const serializedSession = sessionStorage.getItem(SESSION_KEY);
      return serializedSession ? JSON.parse(serializedSession) : null;
    } catch (error) {
      return null;
    }
  }

  function saveSession(authResponse) {
    const expiresAt = authResponse.expires_at ||
      Math.floor(Date.now() / 1000) + (authResponse.expires_in || 3600);
    const session = {
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
      expires_at: expiresAt,
      email: authResponse.user?.email || '',
      user_id: authResponse.user?.id || ''
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async function supabaseRequest(path, options = {}) {
    const config = await getConfig();
    const response = await fetch(`${config.supabaseUrl}${path}`, {
      ...options,
      headers: {
        apikey: config.supabaseAnonKey,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.msg || result.message || result.error_description || 'La requête Supabase a échoué.');
    }
    return result;
  }

  async function refreshSession(session) {
    if (!session?.refresh_token) return null;
    try {
      const authResponse = await supabaseRequest('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      return saveSession(authResponse);
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function getSession() {
    const session = readStoredSession();
    if (!session?.access_token || session.expires_at * 1000 <= Date.now()) return null;
    return session;
  }

  async function getVerifiedSession() {
    let session = readStoredSession();
    if (!session?.access_token) return null;
    if (session.expires_at * 1000 <= Date.now() + 30000) {
      session = await refreshSession(session);
      if (!session) return null;
    }

    try {
      const user = await supabaseRequest('/auth/v1/user', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const email = (user.email || '').toLowerCase();
      return {
        email,
        userId: user.id,
        isAdmin: user.app_metadata?.role === 'admin',
        accessToken: session.access_token
      };
    } catch (error) {
      return null;
    }
  }

  async function login(email, password) {
    try {
      const authResponse = await supabaseRequest('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });
      saveSession(authResponse);
      const verifiedSession = await getVerifiedSession();
      if (!verifiedSession) throw new Error('Impossible de vérifier la session Supabase.');
      return { success: true, isAdmin: verifiedSession.isAdmin, error: null };
    } catch (error) {
      return { success: false, isAdmin: false, error: error.message };
    }
  }

  async function signup(email, password) {
    try {
      const authResponse = await supabaseRequest('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (authResponse.access_token) saveSession(authResponse);
      return {
        success: true,
        requiresEmailConfirmation: !authResponse.access_token,
        error: null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function logout() {
    const session = readStoredSession();
    if (session?.access_token) {
      try {
        await supabaseRequest('/auth/v1/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
      } catch (error) {
        console.warn('La révocation de session Supabase a échoué.');
      }
    }
    sessionStorage.removeItem(SESSION_KEY);
    window.location.assign('/login.html');
  }

  async function requireAuth() {
    const session = await getVerifiedSession();
    if (session) return session;
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login.html?next=${encodeURIComponent(next)}`);
    return null;
  }

  async function requireAdmin() {
    const session = await getVerifiedSession();
    if (session?.isAdmin) return session;
    window.location.assign(session ? '/index.html' : '/login.html');
    return null;
  }

  async function getEntitlement(modelId) {
    const config = await getConfig();
    const session = await getVerifiedSession();
    if (!session) throw new Error('Connectez-vous pour vérifier votre droit.');
    const response = await fetch(`${config.entitlementsEndpoint}?model=${encodeURIComponent(modelId)}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'La vérification du droit a échoué.');
    if (result.modelId !== modelId || typeof result.paid !== 'boolean') {
      throw new Error('La réponse de vérification du droit est invalide.');
    }
    return result.paid;
  }

  async function hasPaid(userEmail, modelId) {
    const session = await getVerifiedSession();
    if (!session || session.email !== String(userEmail || '').toLowerCase()) return false;
    try {
      return await getEntitlement(modelId);
    } catch (error) {
      console.error('Le statut du droit SAMA CV n’a pas pu être vérifié:', error.message);
      return false;
    }
  }

  async function submitPayment(modelId, transactionId) {
    try {
      const config = await getConfig();
      const session = await getVerifiedSession();
      if (!session) return { success: false, error: 'Connectez-vous avant de vérifier le paiement.' };
      if (!config.paymentSubmissionEndpoint) {
        return { success: false, error: 'La soumission serveur du paiement n’est pas configurée.' };
      }
      const response = await fetch(config.paymentSubmissionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ modelId, transactionId })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.status !== 'pending') {
        return { success: false, error: result.error || 'La demande de vérification n’a pas été enregistrée.' };
      }
      return { success: true, status: result.status, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  Object.assign(window, {
    getSamaConfig: getConfig,
    getSession,
    getVerifiedSession,
    login,
    signup,
    logout,
    requireAuth,
    requireAdmin,
    getEntitlement,
    hasPaid,
    submitPayment
  });
})();