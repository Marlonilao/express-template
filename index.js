require('dotenv').config();

const express = require('express');
const path = require('node:path');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const pool = require('./db/pool');
const pgSession = require('connect-pg-simple')(session);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));

app.use(
  session({
    store: new pgSession({
      pool: pool, // Connection pool
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    // Insert express-session options here
  }),
);

require('./passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Server running on port ${PORT}`);
});
