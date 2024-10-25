import express from 'express';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import secrets from './secrets.js';
import pagesRouter from './routes/pages.js';

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

// Verwende die Router
app.use('/', pagesRouter);

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
