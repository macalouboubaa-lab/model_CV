const {
  adminRequest,
  getAuthenticatedUser,
  parseBody,
  sendJson,
  isModelId
} = require('../lib/supabase-api');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user?.id || !auth.user.email) {
      return sendJson(response, 401, { error: 'Connectez-vous pour soumettre votre paiement.' });
    }

    const body = await parseBody(request);
    const modelId = body.modelId;
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId.trim() : '';
    if (!isModelId(modelId) || transactionId.length < 6 || transactionId.length > 128) {
      return sendJson(response, 400, { error: 'Modèle ou identifiant de transaction invalide.' });
    }

    const existingEntitlement = await adminRequest(
      `/rest/v1/entitlements?select=model_id&user_id=eq.${encodeURIComponent(auth.user.id)}&model_id=eq.${encodeURIComponent(modelId)}&limit=1`
    );
    if (existingEntitlement.length) {
      return sendJson(response, 409, { error: 'Vous avez déjà accès à ce modèle.' });
    }

    const rows = await adminRequest('/rest/v1/payments', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify([{
        user_id: auth.user.id,
        user_email: auth.user.email,
        model_id: modelId,
        transaction_id: transactionId,
        amount_xof: 2000,
        status: 'pending'
      }])
    });
    return sendJson(response, 201, {
      paymentId: rows[0].id,
      status: rows[0].status
    });
  } catch (error) {
    if (error.statusCode === 409 || error.statusCode === 23505) {
      return sendJson(response, 409, { error: 'Cet identifiant de transaction a déjà été soumis.' });
    }
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Payment submission failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 || statusCode === 400 || statusCode === 413
        ? error.message
        : 'La soumission du paiement a échoué.'
    });
  }
};
