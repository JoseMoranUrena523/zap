const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const request = require('request');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
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

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
    styleSrc: ["'self'", "cdn.jsdelivr.net"],
    imgSrc: ["'self'"],
    objectSrc: ["'none'"]
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
    callbackURL: 'http://localhost:3000/callback', // Adjust the callback URL
    passReqToCallback: true // Pass the request object to the callback
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
  
        const userInfo = JSON.parse(body);
        profile.user_info = userInfo;
  
        return done(null, profile);
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
app.get('/login', rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again later.'
}), csurf(), passport.authenticate('auth0', {
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
  // Check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Access user info from the session
  const userDisplayName = req.session.passport.user.displayName;
  const userId = req.session.passport.user.user_id;

  // Create the user profile JSON object
  const userProfile = {
    displayName: userDisplayName,
    userId: userId,
  };

  res.status(200).json(userProfile);
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
  
// Start server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
