/**
 * ============================================================
 *  VULNERABLE DEMO SERVER (MICROSOFT SQL SERVER EDITION)
 *  FOR CONTROLLED CLASSROOM USE ONLY
 * ============================================================
 *  This file INTENTIONALLY contains insecure coding practices
 *  (string-concatenated SQL queries and un-escaped HTML output)
 *  so that students can OBSERVE how SQL Injection and Cross-Site
 *  Scripting (XSS) occur. It must never be used as a template
 *  for a real application and should only be run on localhost
 *  against the sample "finsecure_demo" database created by
 *  database/schema.sql.
 *
 *  Compare this file with secure-app/server.js to see the fix
 *  for every vulnerability demonstrated here.
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = process.env.VULN_PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'finsecure_demo',
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  options: { encrypt: false, trustServerCertificate: true }
};

let poolPromise = sql.connect(config)
  .then(pool => {
    console.log('[vulnerable-demo] Connected to SQL Server');
    return pool;
  })
  .catch(err => console.error('[vulnerable-demo] DB connection failed:', err.message));

/* ------------------------------------------------------------
 * 1) LOGIN — VULNERABLE TO SQL INJECTION
 * ------------------------------------------------------------
 * The username/password are concatenated DIRECTLY into the SQL
 * string. Typing   admin' -- in the username field, with any
 * password, lets an attacker bypass the password check entirely
 * because the rest of the query is "commented out" by the T-SQL
 * line-comment token, exactly as it works in MySQL.
 * ---------------------------------------------------------- */
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // !!! INSECURE: never build SQL by string concatenation !!!
  const query =
    "SELECT * FROM dbo.users WHERE username = '" + username +
    "' AND password = '" + password + "'";

  console.log('Running query:', query); // shown so students can see the injected SQL

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    const rows = result.recordset;

    if (rows.length > 0) {
      res.send(
        '<h2>Login successful (VULNERABLE DEMO)</h2>' +
        '<p>Welcome, ' + username + '!</p>' + // also reflects input unescaped (XSS)
        '<p><a href="/login">Back</a></p>'
      );
    } else {
      res.send('<h3>Invalid credentials</h3><p><a href="/login">Try again</a></p>');
    }
  } catch (err) {
    // !!! INSECURE: leaks raw database error details to the client !!!
    res.status(500).send('<h3>Database error:</h3><pre>' + err.message + '</pre>');
  }
});

/* ------------------------------------------------------------
 * 2) COMMENT BOARD — VULNERABLE TO CROSS-SITE SCRIPTING (XSS)
 * ------------------------------------------------------------
 * User-supplied "content" is stored as-is and then written
 * straight into the HTML response with no escaping. A comment
 * like  <script>alert(document.cookie)</script>  will EXECUTE
 * in the browser of every visitor who views the comments page.
 * ---------------------------------------------------------- */
app.get('/comments', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM dbo.comments ORDER BY id DESC');
    const rows = result.recordset;

    let rowsHtml = rows.map(r =>
      '<div class="comment"><b>' + r.author + ':</b> ' + r.content + '</div>'
      // !!! INSECURE: r.author and r.content are injected RAW, no escaping !!!
    ).join('');

    res.send(`
      <h2>Comments (VULNERABLE DEMO)</h2>
      <form method="POST" action="/comments">
        <input name="author" placeholder="Your name" required>
        <input name="content" placeholder="Your comment" required style="width:300px">
        <button type="submit">Post</button>
      </form>
      <hr>${rowsHtml}
      <p><a href="/login">Go to login demo</a></p>
      <p style="color:red">Try posting: &lt;script&gt;alert('XSS')&lt;/script&gt;</p>
    `);
  } catch (err) {
    res.status(500).send('DB error: ' + err.message);
  }
});

app.post('/comments', async (req, res) => {
  const { author, content } = req.body;
  // !!! INSECURE: no validation, no sanitization, no escaping on output !!!
  try {
    const pool = await poolPromise;
    await pool.request().query(
      "INSERT INTO dbo.comments (author, content) VALUES ('" + author + "', '" + content + "')"
    );
    res.redirect('/comments');
  } catch (err) {
    res.status(500).send('DB error: ' + err.message);
  }
});

app.get('/', (req, res) => res.redirect('/login'));

app.listen(PORT, () => {
  console.log(`\n[VULNERABLE DEMO] running at http://localhost:${PORT}`);
  console.log('This server is intentionally insecure — classroom use only.\n');
});
