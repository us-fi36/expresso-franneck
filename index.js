import express from 'express';
import pool from './db.js';
import bcrypt from 'bcryptjs';

const app = express();

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
  res.render('index', { title: 'Startseite', message: 'Willkommen auf der Startseite!' });
});

// Route für die Registrierung (GET)
app.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Registrierung', 
    message: 'Registrierung', 
    errorMessage: null,   // Leere Fehlermeldung, wenn keine Fehler vorliegen
    successMessage: null   // Leere Erfolgsmeldung, wenn keine Erfolgsmeldung vorliegt
  });
});

// Route für die Registrierung (POST)
app.post('/register', async (req, res) => {
  const { username, name, email, password, confirmPassword } = req.body;

  // Prüfe, ob die Passwörter übereinstimmen
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
    // Prüfe, ob der Benutzername bereits existiert
    const existingUser = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.render('register', {
        title: 'Registrierung',
        message: 'Registrierung',
        errorMessage: 'Der Benutzername ist bereits vergeben.',
        successMessage: null
      });
    }

    // Prüfe, ob die E-Mail bereits existiert
    const existingEmail = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.render('register', {
        title: 'Registrierung',
        message: 'Registrierung',
        errorMessage: 'Diese E-Mail-Adresse wird bereits verwendet.',
        successMessage: null
      });
    }

    // Hash das Passwort und speichere den Benutzer
    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.query(
      'INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [username, name, email, hashedPassword]
    );

    // Erfolgreiche Registrierung
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

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
