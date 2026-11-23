/**
 * ============================================================
 *  SECURE APP SERVER (MICROSOFT SQL SERVER EDITION)
 *  Demonstrates the FIX for every vulnerability shown in
 *  vulnerable-demo/server.js, using SQL Server via SSMS.
 * ============================================================
 *  Defensive measures implemented here:
 *   1. Parameterized queries (prepared statements)  -> no SQL Injection
 *   2. EJS auto-escaping of all dynamic output       -> no XSS
 *   3. Strong password policy + confirmation check
 *   4. bcrypt password hashing (never plain text)
 *   5. Basic brute-force lockout after repeated failed logins
 *   6. Centralised error handler that NEVER leaks stack
 *      traces / SQL errors to the client
 *   7. Helmet for secure HTTP headers
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const path = require('path');
const { getPool } = require('./config/db');

const app = express();
const PORT = process.env.SECURE_PORT || 3000;
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 1;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_only_fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 30
  }
}));

const asyncHandler = fn => (req, res, next) => fn(req, res, next).catch(next);

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

/**
 * Small helper that runs a PARAMETERIZED query against SQL Server.
 * `params` is a plain object: { username: 'alice', password: 'x' }.
 * Each key becomes a named parameter (@username, @password) bound
 * with request.input() — this is what prevents SQL Injection,
 * because mssql sends the query text and the values SEPARATELY to
 * the server rather than splicing them into one string.
 */
async function run(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return request.query(queryText);
}

/* ------------------------------------------------------------
 * VALIDATION HELPERS (defensive programming / input validation)
 * ---------------------------------------------------------- */
function isValidUsername(username) {
  return typeof username === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function getPasswordPolicyErrors(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter.');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number.');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain a special character.');
  return errors;
}

/* ------------------------------------------------------------
 * HOME
 * ---------------------------------------------------------- */
app.get('/', (req, res) => res.redirect('/login'));

/* ------------------------------------------------------------
 * REGISTRATION
 * ---------------------------------------------------------- */
app.get('/register', (req, res) => {
  res.render('register', { errors: [], username: '' });
});

app.post('/register', asyncHandler(async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  const errors = [];

  if (!isValidUsername(username)) {
    errors.push('Username must be 3-20 characters: letters, numbers, underscore only.');
  }
  errors.push(...getPasswordPolicyErrors(password));
  if (password !== confirmPassword) {
    errors.push('Password and confirmation do not match.');
  }

  if (errors.length > 0) {
    return res.render('register', { errors, username: username || '' });
  }

  // Parameterized query -> SAFE from SQL Injection
  const existing = await run(
    'SELECT id FROM dbo.secure_users WHERE username = @username',
    { username }
  );
  if (existing.recordset.length > 0) {
    return res.render('register', { errors: ['That username is already taken.'], username: '' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS); // never store plain text
  await run(
    'INSERT INTO dbo.secure_users (username, password_hash) VALUES (@username, @passwordHash)',
    { username, passwordHash }
  );

  res.render('login', { error: null, info: 'Registration successful. Please log in.' });
}));

/* ------------------------------------------------------------
 * LOGIN  (with basic brute-force lockout)
 * ---------------------------------------------------------- */
app.get('/login', (req, res) => {
  res.render('login', { error: null, info: null });
});

app.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || typeof password !== 'string' || password.length === 0) {
    return res.render('login', { error: 'Invalid username or password.', info: null });
  }

  // Parameterized query -> SAFE from SQL Injection
  const result = await run(
    'SELECT * FROM dbo.secure_users WHERE username = @username',
    { username }
  );

  const genericError = 'Invalid username or password.';

  if (result.recordset.length === 0) {
    return res.render('login', { error: genericError, info: null });
  }

  const user = result.recordset[0];

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const waitSecs = Math.ceil((new Date(user.locked_until) - new Date()) / 1000);
    return res.render('login', { error: `Account temporarily locked. Try again in ${waitSecs}s.`, info: null });
  }

  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    const attempts = (user.failed_attempts || 0) + 1;
    const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
      : null;

    await run(
      'UPDATE dbo.secure_users SET failed_attempts = @attempts, locked_until = @lockedUntil WHERE id = @id',
      { attempts, lockedUntil, id: user.id }
    );
    return res.render('login', { error: genericError, info: null });
  }

  await run(
    'UPDATE dbo.secure_users SET failed_attempts = 0, locked_until = NULL WHERE id = @id',
    { id: user.id }
  );
  req.session.user = { id: user.id, username: user.username };
  res.redirect('/dashboard');
}));

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

/* ------------------------------------------------------------
 * DASHBOARD (protected route)
 * ---------------------------------------------------------- */
app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

/* ------------------------------------------------------------
 * COMMENTS — same feature as the vulnerable demo, now SAFE:
 *   - EJS's <%= %> auto-escapes output -> prevents stored XSS
 *   - length-limited, trimmed input validation
 *   - parameterized INSERT -> prevents SQL Injection
 * ---------------------------------------------------------- */
app.get('/comments', requireLogin, asyncHandler(async (req, res) => {
  const result = await run('SELECT TOP 50 * FROM dbo.comments ORDER BY id DESC');
  res.render('comments', { comments: result.recordset, error: null, user: req.session.user });
}));

app.post('/comments', requireLogin, asyncHandler(async (req, res) => {
  let { content } = req.body;
  const author = req.session.user.username; // never trust a client-supplied author field

  if (typeof content !== 'string') content = '';
  content = content.trim().slice(0, 300); // defensive length cap

  if (content.length === 0) {
    const result = await run('SELECT TOP 50 * FROM dbo.comments ORDER BY id DESC');
    return res.render('comments', { comments: result.recordset, error: 'Comment cannot be empty.', user: req.session.user });
  }

  // Parameterized query -> SAFE from SQL Injection
  await run(
    'INSERT INTO dbo.comments (author, content) VALUES (@author, @content)',
    { author, content }
  );
  res.redirect('/comments');
}));

/* ------------------------------------------------------------
 * 404 HANDLER
 * ---------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

/* ------------------------------------------------------------
 * CENTRALISED ERROR HANDLER
 * Logs full details on the SERVER only; sends a generic message
 * to the client so no stack trace / SQL / file-path information
 * is ever exposed (prevents information-disclosure attacks).
 * ---------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error('[secure-app] Unhandled error:', err); // detailed log, server-side only
  res.status(500).render('error', { message: 'Something went wrong. Please try again later.' });
});

app.listen(PORT, () => {
  console.log(`\n[SECURE APP] running at http://localhost:${PORT}\n`);
});
