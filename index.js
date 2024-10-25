import express from 'express';
import cookieParser from 'cookie-parser';
import pagesRouter from './routes/pages.js';
import usersRouter from './routes/users.js'; // Benutzer-Routen importieren

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

// Verwende die Router
app.use('/', pagesRouter); // Seiten-Routen
app.use('/', usersRouter); // Benutzer-Routen

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
