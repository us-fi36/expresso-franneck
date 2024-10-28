import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path'; // Import der path-Bibliothek
import pagesRouter from './routes/pages.js';
import usersRouter from './routes/users.js'; // Benutzer-Routen importieren
import todosRouter from './routes/todo-api.js';

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.static('public')); // Serviert statische Dateien im public-Ordner
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), 'public'))); // Statische Dateien bereitstellen

// Verwende die Router
app.use('/', pagesRouter); // Seiten-Routen
app.use('/', usersRouter); // Benutzer-Routen
app.use('/todo-api', todosRouter); // Todo-Routen

// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});
