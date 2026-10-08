import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Hasher le mot de passe (même méthode que le SQL)
    const passwordHash = crypto
      .createHash('sha256')
      .update(password + process.env.PASSWORD_SALT)
      .digest('hex');

    // Chercher l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, is_admin, is_banned')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Compte banni' });
    }

    // Mettre à jour last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Retourner succès
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}