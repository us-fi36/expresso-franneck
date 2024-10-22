import express from 'express';
const app = express();

// Setze den View-Engine auf EJS
app.set('view engine', 'ejs');

// Stelle sicher, dass der Ordner "views" als Standard für Templates genutzt wird
app.set('views', './views');

// Route für die Startseite
app.get('/', (req, res) => {
  // Render die index.ejs und übergebe Variablen
  res.render('index', { title: 'Startseite', message: 'Willkommen auf der Startseite!' });
});

// Route für die About-Seite
app.get('/about', (req, res) => {
  res.render('about', { title: 'About', message: 'Dies ist die About-Seite.' });
});

// Route für die Contact-Seite
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', message: 'Dies ist die Contact-Seite.' });
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
