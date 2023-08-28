const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const fetch = require('node-fetch');

const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'zap-secretive-secret-that-no-one-knows-haha',
  baseURL: 'https://sat-zap.com',
  clientID: 'zrsJruo4diUxQLhJ2iBti3mBPZH1ioRn',
  issuerBaseURL: 'https://zap-lightning.us.auth0.com'
};

app.use(auth(config));
app.use("/public", express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

app.get('/support', (req, res) => {
  res.redirect("mailto:support@sat-zap.com");
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get('/dashboard', requiresAuth(), (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(__dirname + '/privacy-policy.html');
});

app.get('/get-item', (req, res) => {
  const key = req.query.key;
  const apiKeyUrl = 'https://corsproxy.io/?' + encodeURIComponent(`https://database.sat-zap.com/get?key=${key}`);
  
  fetch(apiKeyUrl, {
    headers: {
      'x-api-key': '!apiKeyForZapInterface12312!'
    }
  })
  .then(response => response.json())
  .then(responseJson => {
    res.json(responseJson);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  });
});

app.listen(8080, () => {
  console.log('Server started on port 8080!');
});
