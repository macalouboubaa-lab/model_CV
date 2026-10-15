const {
  adminRequest,
  getAuthenticatedUser,
  isAdmin,
  parseBody,
  sendJson
} = require('../../lib/supabase-api');

module.exports = async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return sendJson(response, 405, { error: 'Méthode non autorisée.' });
  }

  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user?.id) return sendJson(response, 401, { error: 'Session invalide.' });
    if (!isAdmin(auth.user)) return sendJson(response, 403, { error: 'Accès administrateur requis.' });

    if (request.method === 'GET') {
      const pageValue = request.query?.page;
      const limitValue = request.query?.limit;
      const page = pageValue === undefined ? 1 : Number(pageValue);
      const limit = limitValue === undefined ? 50 : Number(limitValue);
      if (!Number.isSafeInteger(page) || page < 1 ||
        !Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
        !Number.isSafeInteger((page - 1) * limit)) {
        return sendJson(response, 400, { error: 'Les paramètres page et limit sont invalides (limit maximal : 100).' });
      }

      const offset = (page - 1) * limit;
      const rows = await adminRequest(
        `/rest/v1/payments?select=id,user_email,model_id,transaction_id,amount_xof,status,created_at,reviewed_at&order=created_at.desc&limit=${limit + 1}&offset=${offset}`
      );
      return sendJson(response, 200, {
        payments: rows.slice(0, limit),
        pagination: { page, limit, hasMore: rows.length > limit }
      });
    }

    const body = await parseBody(request);
    if (typeof body.paymentId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.paymentId)) {
      return sendJson(response, 400, { error: 'Identifiant de demande invalide.' });
    }
    if (!['approved', 'rejected'].includes(body.decision)) {
      return sendJson(response, 400, { error: 'Décision invalide.' });
    }

    const result = await adminRequest('/rest/v1/rpc/review_manual_payment', {
      method: 'POST',
      body: JSON.stringify({
        p_payment_id: body.paymentId,
        p_decision: body.decision,
        p_reviewed_by: auth.user.id
      })
    });
    return sendJson(response, 200, { payment: result });
  } catch (error) {
    const statusCode = error.code === 'P0001' ? 409 : (error.statusCode || 500);
    if (statusCode >= 500) console.error('Manual payment review failed:', error.message);
    return sendJson(response, statusCode, {
      error: statusCode === 503 || statusCode === 400 || statusCode === 413
        ? error.message
        : 'La validation manuelle a échoué.'
    });
  }
};
