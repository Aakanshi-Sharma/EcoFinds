const express = require('express');
const path = require('path');
const app = express();
const PORT = 12000;

// Set up middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

// Placeholder for dashboard route
app.get('/dashboard', (req, res) => {
  res.send('<h1>Welcome to EcoFinds Dashboard</h1><p>This is a placeholder for the dashboard page.</p><a href="/login">Logout</a>');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Access the application at:`);
  console.log(`- Login: https://work-1-eluaijjuemqmtmsa.prod-runtime.all-hands.dev/login`);
  console.log(`- Signup: https://work-1-eluaijjuemqmtmsa.prod-runtime.all-hands.dev/signup`);
});