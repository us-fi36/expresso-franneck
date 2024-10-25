import express from 'express';

const router = express.Router();

// Startseite
router.get('/', (req, res) => {
    res.render('index', { title: 'Startseite', message: 'Willkommen auf der Startseite!' });
});

// Route für Login-Seite (GET)
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', message: 'Login', error: null });
});

// Route für Registrierung-Seite (GET)
router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Registrierung', 
        message: 'Registrierung', 
        errorMessage: null, 
        successMessage: null 
    });
});

// Export des Routers
export default router;
