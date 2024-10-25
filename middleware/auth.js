// middleware/auth.js

import jwt from 'jsonwebtoken';
import secrets from '../secrets.js';

// Middleware für Authentifizierung
export function authenticateToken(req, res, next) {
    const token = req.cookies['token'];
    if (!token) {
        return res.status(401).redirect('/login');
    }

    try {
        res.locals.user = jwt.verify(token, secrets.jwt_secret_key);
        next();
    } catch (err) {
        return res.status(403).redirect('/login');
    }
}
