// routes/users.js

import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import secrets from '../secrets.js';
import { authenticateToken } from '../middleware/auth.js'; // Importiere die Authentifizierungsmiddleware

const router = express.Router();

// Route für Registrierung (POST)
router.post('/register', async (req, res) => {
    const { username, name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', {
            title: 'Registrierung',
            message: 'Registrierung',
            errorMessage: 'Die Passwörter stimmen nicht überein.',
            successMessage: null
        });
    }

    const conn = await pool.getConnection();
    try {
        const existingUser = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.render('register', {
                title: 'Registrierung',
                message: 'Registrierung',
                errorMessage: 'Der Benutzername ist bereits vergeben.',
                successMessage: null
            });
        }

        const existingEmail = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.render('register', {
                title: 'Registrierung',
                message: 'Registrierung',
                errorMessage: 'Diese E-Mail-Adresse wird bereits verwendet.',
                successMessage: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await conn.query(
            'INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
            [username, name, email, hashedPassword]
        );

        res.render('register', {
            title: 'Registrierung',
            message: 'Registrierung',
            errorMessage: null,
            successMessage: 'Die Registrierung war erfolgreich!'
        });
    } catch (err) {
        console.log(err);
        res.render('register', {
            title: 'Registrierung',
            message: 'Registrierung',
            errorMessage: 'Es gab einen Fehler bei der Registrierung.',
            successMessage: null
        });
    } finally {
        conn.release();
    }
});

// Route für den Login (POST)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const conn = await pool.getConnection();
    let user;

    try {
        user = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    } catch (err) {
        console.log(err);
        return res.status(500).render('login', { title: 'Login', message: 'Login', error: 'Fehler beim Login' });
    } finally {
        conn.release();
    }

    if (!user || user.length === 0) {
        return res.status(404).render('login', { title: 'Login', message: 'Login', error: 'Benutzer nicht gefunden.' });
    }

    const userData = user[0];
    const isMatch = await bcrypt.compare(password, userData.password_hash);

    if (!isMatch) {
        return res.status(403).render('login', { title: 'Login', message: 'Login', error: 'Falsches Passwort' });
    }

    try {
        const token = jwt.sign(
            { username: userData.username, name: userData.name, email: userData.email },
            secrets.jwt_secret_key,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true }).redirect('/dashboard');
    } catch (err) {
        console.log(err);
        return res.status(500).render('login', { title: 'Login', message: 'Login', error: 'Fehler beim Erstellen des Tokens' });
    }
});

// Route für das Dashboard (geschützter Bereich)
router.get('/dashboard', authenticateToken, (req, res) => {
    res.render('dashboard', { title: 'Dashboard', user: res.locals.user });
});

// Logout Route
router.post('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

// Export des Routers
export default router;
