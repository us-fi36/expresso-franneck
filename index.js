import express from 'express';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import secrets from './secrets.js';

const app = express();

// Cookie-Parser-Middleware verwenden
app.use(cookieParser());

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

// Route für die Login-Seite (GET)
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', message: 'Login' });
});

// Route für die eingeloggt-Seite
app.get('/eingeloggt', (req, res) => {
  const token = req.cookies['token'];
  let loggedInUser = false;

  if (token) {
      // Token verifizieren und Benutzerdaten erhalten
      jwt.verify(token, secrets.jwt_secret_key, (err, user) => {
          if (err) {
              // Token ungültig
              console.log(err);
          } else {
              loggedInUser = user; // Benutzerinformationen aus dem Token extrahieren
          }
      });
  }

  res.render('eingeloggt', {
      title: 'Willkommen zurück!',
      message: 'Sie sind erfolgreich eingeloggt!',
      user: loggedInUser // Benutzerinformationen an das Template übergeben
  });
});

// Route für die Registrierung (GET)
app.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Registrierung', 
    message: 'Registrierung', 
    errorMessage: null,   // Leere Fehlermeldung, wenn keine Fehler vorliegen
    successMessage: null  // Leere Erfolgsmeldung, wenn keine Erfolgsmeldung vorliegt
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

// Route für den Login (POST)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const conn = await pool.getConnection();
  let user;

  try {
    user = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
  } catch (err) {
    console.log(err);
    return res.status(500).render('login', { title: 'Login', error: 'Fehler beim Login' });
  } finally {
    conn.release();
  }

  if (user && user.length === 0) {
    return res.status(404).render('login', { title: 'Login', error: 'Benutzer nicht gefunden.' });
  }

  const userData = user[0]; // Zugriff auf den Benutzer aus der Datenbank
  const isMatch = await bcrypt.compare(password, userData.password_hash);

  if (!isMatch) {
    return res.status(403).render('login', { title: 'Login', error: 'Falsches Passwort' });
  }

  // JWT erstellen und als Cookie setzen
  try {
    const token = jwt.sign(
      { username: userData.username, name: userData.name, email: userData.email }, // Token-Daten
      secrets.jwt_secret_key,  // Geheimen Schlüssel von secrets.js verwenden
      { expiresIn: '1h' }      // Token läuft nach 1 Stunde ab
    );

    // Token als HTTP-Only-Cookie setzen und weiterleiten
    res.cookie('token', token, { httpOnly: true }).redirect('/eingeloggt');
  } catch (err) {
    console.log(err);
    return res.status(500).render('login', { title: 'Login', error: 'Fehler beim Erstellen des Tokens' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token').redirect('/');
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
