const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const request = require('request');
const csurf = require('csurf');
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

app.use(csurf());

// Security headers for enhanced protection
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
    styleSrc: ["'self'", "cdn.jsdelivr.net"],
    imgSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"] // Prevents framing your site in an iframe
  }
}));

app.use(helmet.frameguard({ action: 'deny' })); // X-Frame-Options
app.use(helmet.xssFilter()); // X-XSS-Protection
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })); // Strict-Transport-Security

// Configure Passport
passport.use(new Auth0Strategy({
    domain: 'dev-zggqvh0tncla0n3k.us.auth0.com',
    clientID: '7r0iximHfNEJRa3pJduqo8x8ak5LKRWT',
    clientSecret: '8H24IaSP3zmRCIPoPmrlHKwPmT456lkDbrHb8I2ZDnAGYA4u7PXWMHbIRKe9goT-',
    callbackURL: 'https://zap-lightning-6bpgo.ondigitalocean.app/callback'
}, (req, accessToken, refreshToken, extraParams, profile, done) => {
    // Make a request to the /userinfo endpoint using the accessToken
    request.get(
      {
        url: 'https://dev-zggqvh0tncla0n3k.us.auth0.com/userinfo', // Replace with your Auth0 domain
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      (err, response, body) => {
        if (err) {
          return done(err);
        }
  
        try {
          const userInfo = JSON.parse(body);
          profile.user_info = userInfo;
  
          return done(null, profile);
        } catch (error) {
          return done(error);
        }
      }
    );
  }));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Auth Routes
app.get('/login', csurf(), passport.authenticate('auth0', {
  scope: 'openid profile'
}));

app.get('/callback',
  csurf(),
  passport.authenticate('auth0', {
    failureRedirect: '/'
  }),
  (req, res) => {
    res.redirect('/dashboard'); // Redirect after successful login
  }
);

app.get('/dashboardData', (req, res) => {
  try {
    // Access user info from the session
    const userDisplayName = req.session.passport.user.displayName;
    const userId = req.session.passport.user.user_id;

    // Create the user profile JSON object
    const userProfile = {
      displayName: userDisplayName,
      userId: userId,
    };

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching dashboard data' });
  }
});

// Serve the dashboard.html file for the /dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// Passport serialize function
passport.serializeUser((user, done) => {
  done(null, user);
});
  
// Passport deserializeUser function
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  // Send an appropriate error response to the client
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(8080, () => {
  console.log('Server started on https://zap-lightning-6bpgo.ondigitalocean.app/');
});
