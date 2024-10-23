import express from 'express';
const app = express();
import pool from './db.js';
import bcrypt from 'bcryptjs';

// Statische Dateien bereitstellen
app.use(express.static('public'));

// Setze den View-Engine auf EJS
app.set('view engine', 'ejs');

// Standard für Templates 
app.set('views', './views');

// Middleware, um URL-encoded-Daten zu verarbeiten
app.use(express.urlencoded({ extended: true }));

// Route für die Startseite
app.get('/', (req, res) => {
  // Render die index.ejs und übergebe Variablen
  res.render('index', { title: 'Startseite', message: 'Willkommen auf der Startseite!' });
});

// Route für die About-Seite
app.get('/about', (req, res) => {
  res.render('about', { title: 'About', message: 'Überschrift' });
});

// Route für Seite1
app.get('/seite1', (req, res) => {
    res.render('seite1', { title: 'Seite 1', message: 'Überschrift' });
  });

// Route für Seite2
app.get('/seite2', (req, res) => {
    res.render('seite2', { title: 'Seite 2', message: 'Überschrift' });
  });

  // Route für Register
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register', message: 'Register' });
  });

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});

app.post('/register', async (req, res) => {
    console.log(req.body);
    const { username, name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();
   
    try {
      await conn.query('INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
        [username, name, email, hashedPassword]);
      res.status(201).redirect('/');
    } catch (err) {
      console.log(err);
      res.status(500).send('Fehler bei der Registrierung');
    } finally {
      conn.release();
    }
  });