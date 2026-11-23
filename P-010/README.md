# FinSecure Solutions — Web Security Practical (WTF Practical 10)
### Aim: Understand common web security vulnerabilities (XSS, SQL Injection) and implement secure coding, password protection, and defensive programming practices.
### 🗄️ This edition uses MICROSOFT SQL SERVER (via SSMS), not MySQL

> ⚠️ **Ethics note:** The `vulnerable-demo` app is an intentionally insecure sandbox built **only** to let you *observe* how these vulnerabilities occur on your own `localhost`. Never deploy it, expose it to a network, or apply these insecure patterns to a real application. The whole point of the practical is to then fix it in `secure-app`.

---

## 1. Project Structure

```
finsecure-security-practical/
│
├── package.json              → dependencies for BOTH apps
├── .env.example               → copy to .env and fill in your SQL Server connection details
├── database/
│   └── schema.sql              → creates finsecure_demo DB + all tables
│
├── vulnerable-demo/            → runs on http://localhost:3001
│   ├── server.js               → INSECURE code (SQLi + XSS), heavily commented
│   └── views/login.html
│
└── secure-app/                 → runs on http://localhost:3000
    ├── server.js                → SECURE code (parameterized queries, bcrypt, escaping, error handling)
    ├── config/db.js             → SQL Server connection pool (mssql)
    ├── public/style.css
    └── views/ (login, register, dashboard, comments, error) .ejs
```

---

## 2. Prerequisites

- **Node.js** (v18+) and npm installed
- **Microsoft SQL Server** (Express/Developer edition is fine) with **SQL Server Management Studio (SSMS)** installed and able to connect to your instance
- **Visual Studio Code**
- Google Chrome and Mozilla Firefox (for testing)

---

## 3. STEP-BY-STEP SETUP (using SSMS)

### Step 1 – Extract and open the project
1. Unzip `FinSecure-Security-Practical.zip`.
2. Open the extracted folder in **VS Code** (`File → Open Folder`).

### Step 2 – Find your SQL Server instance name
1. Open **SQL Server Management Studio**.
2. In the **"Connect to Server"** dialog, note the exact **Server name** you use to connect
   (e.g. `localhost`, `localhost\SQLEXPRESS`, `DESKTOP-ABC123\SQLEXPRESS`, or `.`).
   You will need this exact string for the `.env` file in Step 5.
3. Note whether you connect using **Windows Authentication** or **SQL Server Authentication**
   (a username/password) — you selected this in the same dialog's "Authentication" dropdown.

### Step 3 – Create the database using SSMS
1. In SSMS, connect to your instance (as in Step 2).
2. Click **File → Open → File…** and open `database/schema.sql` from the project.
3. Click **Execute** (or press **F5**) to run the whole script.
   - This creates the `finsecure_demo` database with:
     - `users` (plain-text password, used only by the vulnerable demo)
     - `comments` (shared by both demos)
     - `secure_users` (bcrypt password hashes, used only by the secure app)
4. In the **Object Explorer** on the left, right-click **Databases → Refresh** and confirm
   `finsecure_demo` now appears, with the three tables under `finsecure_demo → Tables`.

### Step 4 – If you want a dedicated SQL login (recommended but optional)
If you'd rather not use Windows Authentication from Node.js, create a SQL login in SSMS:
1. In Object Explorer: **Security → Logins** → right-click → **New Login…**
2. Choose **SQL Server authentication**, set a username (e.g. `finsecure_app`) and password,
   untick "Enforce password expiration" for this practical, click OK.
3. Expand **finsecure_demo → Security → Users** → right-click → **New User…** → map the login
   you just created to this database, and under "Membership", tick `db_owner` (fine for a
   classroom demo; a real app would use a narrower role).
4. Also confirm **TCP/IP** is enabled for your instance: open **SQL Server Configuration Manager**
   → **SQL Server Network Configuration → Protocols** → ensure **TCP/IP** is "Enabled", then
   restart the SQL Server service if you changed it.

### Step 5 – Configure environment variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env`:
   - Set `DB_SERVER` to the exact server/instance name from Step 2 (e.g. `localhost\SQLEXPRESS`).
   - If using **SQL Server Authentication**: set `DB_USER` / `DB_PASSWORD` to the login from Step 4
     (or `sa` and its password, if you enabled the `sa` account).
   - If using **Windows Authentication**: leave `DB_USER` / `DB_PASSWORD` blank — see the note
     under "Windows Authentication" below, since the default setup here expects a SQL login.
   - Set any long random string for `SESSION_SECRET`.

> **Note on Windows Authentication:** the `mssql` npm package's default driver (`tedious`) authenticates
> most reliably with a **SQL Server login** (Step 4), which is why this project is set up that way.
> Windows Authentication from Node.js is possible with the `msnodesqlv8` driver instead, but needs an
> extra native module and a different connection config — for a 3-hour practical, creating one SQL
> login in Step 4 is by far the simplest path.

### Step 6 – Install dependencies
In the project root:
```bash
npm install
```
This installs `express`, `mssql`, `bcrypt`, `ejs`, `express-session`, `helmet`, and `dotenv` for both apps.

### Step 7 – Run the VULNERABLE demo
```bash
npm run vulnerable
```
Open **http://localhost:3001/login** in Chrome. If it fails to connect, double-check `DB_SERVER`,
`DB_USER`, and `DB_PASSWORD` in `.env` against what worked in SSMS's "Connect to Server" dialog.

### Step 8 – Run the SECURE app (in a second terminal)
```bash
npm run secure
```
Open **http://localhost:3000/login** in Chrome.

*(Both servers can run at the same time on their different ports, so you can switch tabs and compare behaviour side by side.)*

### Step 9 – Inspect the data back in SSMS
After registering a user or posting a comment from the browser, go back to SSMS and run:
```sql
USE finsecure_demo;
SELECT * FROM dbo.secure_users;   -- password_hash column: bcrypt hash, never plain text
SELECT * FROM dbo.users;          -- vulnerable-demo table: plain text password, by design
SELECT * FROM dbo.comments;
```
This is a good screenshot for your practical record: it directly shows the hashed vs. plain-text
password storage side by side.

---

## 4. DEMONSTRATION WALKTHROUGH

### A. SQL Injection — Vulnerable demo (port 3001)
1. Go to `http://localhost:3001/login`.
2. In **Username**, type:
   ```
   admin' --
   ```
   Leave the password field with any random text (e.g. `xyz`) and submit.
3. **Observe:** You are logged in without knowing the real password, because the injected
   `--` comments out the rest of the SQL query (`AND password = '...'`), turning the check into
   simply `SELECT * FROM users WHERE username = 'admin'`.
4. Open the browser **Console/Network tab** or the server terminal to see the exact concatenated
   query that was executed — this is the "controlled exploitation" evidence for your record.
5. Also try an invalid username with a stray quote, e.g. `test'`, and observe the raw SQL Server
   error message leaking table/column details in the response (information disclosure).

### B. SQL Injection — Secure app (port 3000)
1. Register an account at `http://localhost:3000/register` with a compliant password
   (e.g. `Secure@123`).
2. Go to `/login` and try the exact same injection string (`admin' --`) as the username.
3. **Observe:** Login fails with the generic message *"Invalid username or password."* —
   the parameterized query (`WHERE username = ?`) treats the entire string as literal data,
   not as part of the SQL syntax, so the injection has no effect.

### C. Cross-Site Scripting (XSS) — Vulnerable demo
1. Go to `http://localhost:3001/comments`.
2. In the comment box, enter:
   ```html
   <script>alert('XSS - cookie: ' + document.cookie)</script>
   ```
3. Submit, then **observe** the alert box pop up immediately — the browser executed the
   injected script because the server wrote `content` straight into the HTML response with
   no escaping.
4. Reload the page — the script fires again for *every visitor*, demonstrating **stored XSS**.

### D. Cross-Site Scripting (XSS) — Secure app
1. Log in at `http://localhost:3000/login`, then go to `/comments`.
2. Enter the exact same payload: `<script>alert('XSS')</script>`.
3. **Observe:** The text is displayed literally as harmless text (`<script>alert('XSS')</script>`)
   instead of executing, because EJS's `<%= %>` tag **HTML-encodes** special characters
   (`<` → `&lt;`, `>` → `&gt;`, etc.) before writing them to the page.

### E. Password Policy & Secure Storage
1. On `/register`, try a weak password like `abc` — note the itemised policy errors returned.
2. Try mismatched confirmation passwords — note the specific error.
3. Register successfully, then **inspect the database**:
   ```sql
   SELECT username, password_hash FROM secure_users;
   ```
   Observe that `password_hash` is a long bcrypt string (e.g. `$2b$12$...`), never the
   original password — compare this with:
   ```sql
   SELECT username, password FROM users;  -- vulnerable-demo table: plain text!
   ```

### F. Brute-Force Lockout & Generic Error Handling
1. On the secure app's login page, submit the correct username with a wrong password **5 times**.
2. **Observe:** On the 5th attempt the account locks for 60 seconds and the message changes to
   *"Account temporarily locked..."* — this defends against automated password-guessing.
3. Trigger a server error deliberately (e.g. temporarily stop your SQL Server service and submit the
   login form). **Observe:** the secure app shows a generic *"Something went wrong..."* page,
   while the terminal (server-side console) logs the full error — compare this with the
   vulnerable demo, which prints raw SQL error text directly into the browser response.

### G. Inspect with Browser DevTools
1. Open DevTools (F12) → **Application tab** → Cookies, and confirm the secure app's session
   cookie has the `HttpOnly` flag set (set via `express-session` + `helmet`), meaning
   JavaScript (and therefore a successful XSS payload) cannot read it via `document.cookie`.
2. Use the **Network tab** to compare response headers between the two apps (Helmet adds
   security headers like `X-Content-Type-Options` and `X-Frame-Options` to the secure app).

---

## 5. Answers to Key Questions / Analysis

### Q1. How does XSS affect confidentiality and integrity? How do secure coding practices prevent it?

**Impact on confidentiality:** A successful XSS payload runs with the same privileges as the
legitimate page in the victim's browser. It can read `document.cookie` (stealing session tokens),
capture keystrokes, or exfiltrate data displayed on the page to an attacker-controlled server —
directly compromising **confidentiality**.

**Impact on integrity:** Because the injected script executes in the trusted origin, it can modify
the DOM, submit forged forms, perform actions on the user's behalf (e.g. transferring money,
changing account details), or deface the page — compromising **integrity** of both the displayed
content and any resulting server-side state changes.

**Prevention through secure coding:**
- **Output encoding/escaping** — always encode dynamic data before inserting it into HTML
  (e.g. EJS `<%= %>`, React's default JSX escaping). This was demonstrated in `secure-app`.
- **Input validation** — reject or sanitize unexpected characters/length at the point of entry.
- **HttpOnly & Secure cookies** — even if a script does run, it cannot read the session cookie.
- **Content-Security-Policy (CSP) headers** (partially enabled via Helmet) — restrict which
  scripts are allowed to execute on the page at all.
- **Never use "raw HTML" insertion** (like string concatenation in `res.send()`, or `innerHTML`
  on the client) with untrusted data.

### Q2. Dynamic SQL vs. parameterized queries — why are parameterized queries recommended?

| | Dynamic (string-concatenated) SQL | Parameterized Queries (Prepared Statements) |
|---|---|---|
| **How it works** | User input is glued directly into the SQL string before execution | Query structure (`SELECT ... WHERE username = ?`) is sent to the DB separately from the data values |
| **Injection risk** | High — a crafted input like `' OR '1'='1` or `admin' --` changes the query's logic | Essentially eliminated — the database treats placeholders strictly as literal data, never as SQL syntax |
| **Example (vulnerable)** | `"SELECT * FROM users WHERE username='" + u + "'"` | `db.query('SELECT * FROM users WHERE username = ?', [u])` |
| **Performance** | Query must be re-parsed every time | Can be pre-compiled/cached by the DB engine, especially when reused |
| **Readability/Maintainability** | Error-prone string building, easy to forget escaping somewhere | Cleaner separation of SQL logic and data; easier to audit |

**Why recommended:** Parameterized queries structurally separate **code** (the SQL statement)
from **data** (user input), so no matter what characters (`'`, `;`, `--`, `OR 1=1`) a user types,
they are bound as a literal value and can never alter the query's logic. This is the industry-standard,
most reliable defense against SQL Injection — far more robust than trying to manually
escape/blacklist dangerous characters.

### Q3. Why is password hashing and a strong password policy important? Why never store passwords in plain text?

- **If passwords are stored in plain text** and the database is ever breached (via SQL Injection,
  misconfiguration, insider threat, or backup leak), every user's actual password is immediately
  exposed — and because people frequently reuse passwords, this compromises their accounts on
  *other* unrelated sites too.
- **Password hashing** (e.g. bcrypt) applies a one-way cryptographic function: it's computationally
  infeasible to reverse a hash back into the original password. Even if the `secure_users` table
  is leaked, attackers only get hashes, not passwords.
- **Salting** (built into bcrypt automatically) ensures two users with the same password get
  different hashes, defeating precomputed "rainbow table" attacks.
- **Adaptive cost factor** (bcrypt's "rounds", set to 12 here) makes brute-forcing each hash
  deliberately slow, so even offline cracking attempts of a leaked hash table take impractically
  long.
- **Strong password policy** (minimum length + complexity: upper/lower case, digit, special
  character) reduces the chance of users picking weak, easily-guessed passwords (`123456`,
  `password`) that could be cracked quickly even after hashing, and the **confirmation field**
  prevents accidental typos from locking users out of accounts they just created.
- Together, hashing + policy + lockout (as implemented in `secure-app`) form **defense in depth**:
  even if one layer fails, the others still protect user credentials.

---

## 6. Supplementary Problems — How to Approach Them Using This Project

1. **Analyze a simple login module and recommend countermeasures:**
   Use `vulnerable-demo/server.js`'s `/login` route as the subject of analysis. Document each
   flaw (string-concatenated query, plain-text password comparison, verbose error messages,
   reflected input) and map each one to its corresponding fix already implemented in
   `secure-app/server.js` (parameterized query, bcrypt compare, generic error handler, escaped
   output) — this makes a ready-made comparison table for your report.

2. **Enhance a registration form with secure validation, hashing, and error handling:**
   `secure-app`'s `/register` route already demonstrates this end-to-end: username format
   validation, the 4-rule password policy, confirmation matching, duplicate-username checking
   via a parameterized `SELECT`, bcrypt hashing before `INSERT`, and the shared error-rendering
   pattern (`errors` array passed to `register.ejs`). You can extend it further by adding:
   - An email field with regex validation
   - A password-strength meter (client-side JavaScript, not a substitute for server-side checks)
   - CAPTCHA or a short delay after repeated failed registrations

---

## 7. Key Skills Demonstrated
- Identifying and safely demonstrating SQL Injection and XSS in a controlled sandbox
- Secure coding: parameterized queries / prepared statements
- Output encoding to prevent XSS (EJS auto-escaping)
- Strong password policy design and validation
- Secure password storage using bcrypt hashing (with salting)
- Session security (HttpOnly cookies, Helmet security headers)
- Defensive programming: brute-force lockout, generic error handling, centralized error middleware

---

**Total Engagement:** 3 Hours
- 2 Hours: Vulnerability demonstration (SQLi, XSS) + implementing secure coding countermeasures
- 0.5 Hour: Password policy & hashing implementation
- 0.5 Hour: Review, documentation, and faculty evaluation
