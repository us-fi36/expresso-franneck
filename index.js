import express from 'express';
const app = express();

// Statische Dateien bereitstellen
app.use(express.static('public'));

// Setze den View-Engine auf EJS
app.set('view engine', 'ejs');

// Standard für Templates 
app.set('views', './views');

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

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
