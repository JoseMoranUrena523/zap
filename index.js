const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const request = require('request');
const helmet = require('helmet');

const app = express();

// Configure session
app.use(session({
  secret: 'zap-incredible-session-secret-of-them-all',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "strict"
  }
}));

app.use(helmet());

// Configure Passport
passport.use(new Auth0Strategy({
    domain: 'dev-zggqvh0tncla0n3k.us.auth0.com',
    clientID: '7r0iximHfNEJRa3pJduqo8x8ak5LKRWT',
    clientSecret: '8H24IaSP3zmRCIPoPmrlHKwPmT456lkDbrHb8I2ZDnAGYA4u7PXWMHbIRKe9goT-',
    callbackURL: 'https://zap-lightning-6bpgo.ondigitalocean.app/callback'
}, async (accessToken, refreshToken, extraParams, profile, done) => {
    try {
        const userInfoResponse = await fetch('https://dev-zggqvh0tncla0n3k.us.auth0.com/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!userInfoResponse.ok) {
            console.error('Error in fetching user info:', userInfoResponse.statusText);
            return done(new Error('Failed to fetch user info'));
        }

        const userInfo = await userInfoResponse.json();
        profile.user_info = userInfo;
        console.log('Auth0 callback successful:', profile);
        return done(null, profile);
    } catch (error) {
        console.error('Error in Auth0Strategy:', error);
        return done(error);
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Auth Routes
app.get('/login', passport.authenticate('auth0', {
  scope: 'openid profile'
}));

app.get('/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/'
  }),
  (req, res) => {
    console.log('Successful authentication, redirecting to /dashboard');
    res.redirect('/dashboard'); // Redirect after successful login
  }
);

app.get('/dashboard', (req, res) => {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    // Render the dashboard
    res.sendFile(__dirname + '/dashboard.html');
  } else {
    // Redirect to login if not authenticated
    res.redirect('/login');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('An error occurred:', err.message);

  // Send an appropriate error response to the client
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(8080, () => {
  console.log('Server started on https://zap-lightning-6bpgo.ondigitalocean.app/');
});
