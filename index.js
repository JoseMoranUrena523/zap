const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const cors = require('cors');

const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'zap-secretive-secret-that-no-one-knows-haha',
  baseURL: 'https://sat-zap.com',
  clientID: 'zrsJruo4diUxQLhJ2iBti3mBPZH1ioRn',
  issuerBaseURL: 'https://zap-lightning.us.auth0.com'
};

var corsOptions = {
    origin: '*',
    credentials: true 
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(cors(corsOptions));

// Route for the root page '/'
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

app.get('/lightning-bolt', (req, res) => {
  res.sendFile(__dirname + '/lightning-bolt-removebg-preview.png');
});

// Protected route for the profile page
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// Route for the dashboard page
app.get('/dashboard', requiresAuth(), (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// Start server
app.listen(8080, () => {
  console.log('Server started on port 8080!');
});
