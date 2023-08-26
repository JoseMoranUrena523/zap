const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');

const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'zap-secretive-secret-that-no-one-knows-haha',
  baseURL: 'https://goldfish-app-nusxd.ondigitalocean.app',
  clientID: 'zrsJruo4diUxQLhJ2iBti3mBPZH1ioRn',
  issuerBaseURL: 'https://zap-lightning.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Route for the root page '/'
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
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
  console.log('Server started on https://goldfish-app-nusxd.ondigitalocean.app/');
});
