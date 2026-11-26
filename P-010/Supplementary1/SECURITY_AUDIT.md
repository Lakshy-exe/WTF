# Security Audit: Vulnerable Login Module vs. Hardened Countermeasures

## 1. Identified Vulnerabilities in `vulnerable_login.js`
1. **SQL Injection (CWE-89):** User inputs (`username` and `password`) are concatenated directly into the SQL query string (`"SELECT * FROM users WHERE username = '" + username + "'"`). Entering `' OR '1'='1` bypasses authentication completely.
2. **Plaintext Password Storage (CWE-256):** Passwords are stored and compared in plaintext instead of salted cryptographic hashes.
3. **Verbose Error Messages (CWE-209):** Returning `"Username does not exist"` vs `"Wrong password"` enables user enumeration attacks.
4. **No Rate Limiting / Brute-Force Protection (CWE-307):** Unlimited consecutive login attempts are allowed without lockout or delay.

## 2. Implemented Countermeasures in `secure_server.js`
- **Parameterized Queries / Prepared Statements:** Separates SQL logic from user-supplied data.
- **Bcrypt Password Hashing (`bcryptjs`):** Compares passwords using `bcrypt.compare()` with 10 salt rounds.
- **Generic Authentication Errors:** Always returns `"Invalid username or password"` on failure.
- **In-Memory Brute-Force Lockout:** Blocks an IP/account for 60 seconds after 5 failed attempts.
