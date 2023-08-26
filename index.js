const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const request = require('request');
const cors = require('cors');
const port = process.env.PORT || 3000;

const app = express();

app.use(session({
  secret: 'zap-incredible-session-secret-of-them-all',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "strict"
  }
}));

app.use(cors());

passport.use(new Auth0Strategy({
    domain: 'zap-lightning.us.auth0.com',
    clientID: 'zrsJruo4diUxQLhJ2iBti3mBPZH1ioRn',
    clientSecret: 'ZkIZBNpxM4OaZc1eKAjFOajL55Al4RaGiFLK5NtDJNt_3w42wKaizCGQoN3WSOjM',
    callbackURL: 'https://goldfish-app-nusxd.ondigitalocean.app/callback'
}, (req, accessToken, refreshToken, extraParams, profile, done) => {
    request.get(
      {
        url: 'https://zap-lightning.us.auth0.com/userinfo',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      (err, response, body) => {
        if (err) {
          console.log('Error in Auth0Strategy:', err);
          return done(err);
        }
  
        try {
          const userInfo = JSON.parse(body);
          profile.user_info = userInfo;
          console.log('Auth0 callback successful:', profile);
          return done(null, profile);
        } catch (error) {
          console.log('Error parsing user info:', error);
          return done(error);
        }
      }
    );
  }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', passport.authenticate('auth0', {
  scope: 'openid profile'
}));

app.get('/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/'
  }),
  (req, res) => {
    console.log('Successful authentication, redirecting to /dashboard');
    res.redirect('/dashboard');
  }
);

app.get('/dashboardData', (req, res) => {
  try {
    const userDisplayName = req.session.passport.user.displayName;
    const userId = req.session.passport.user.user_id;

    const userProfile = {
      displayName: userDisplayName,
      userId: userId,
    };

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching dashboard data' });
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

passport.serializeUser((user, done) => {
  done(null, user);
});
  
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(port, () => {
  console.log(`Zap Lightning is up and listening on port ${port}!`);
});
