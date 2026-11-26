const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3021;

app.use(express.json());
app.use(express.static(__dirname));

// Pre-hashed password for 'Admin@123'
const USERS = [
    { id: 1, username: 'admin', passwordHash: bcrypt.hashSync('Admin@123', 10) }
];

const loginAttempts = {};

app.post('/api/secure-login', async (req, res) => {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    // Countermeasure 1: Brute-force protection
    const record = loginAttempts[username] || { count: 0, lockUntil: 0 };
    if (Date.now() < record.lockUntil) {
        return res.status(429).json({ error: 'Account temporarily locked due to multiple failed attempts. Try again in 60s.' });
    }

    // Countermeasure 2: Input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Countermeasure 3: Parameterized lookup + Bcrypt comparison
    const user = USERS.find(u => u.username === username);
    const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isMatch) {
        record.count += 1;
        if (record.count >= 5) {
            record.lockUntil = Date.now() + 60000;
            record.count = 0;
        }
        loginAttempts[username] = record;
        // Countermeasure 4: Generic error message prevents user enumeration
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    delete loginAttempts[username];
    res.json({ message: 'Authenticated securely with Bcrypt & Rate Limiting!' });
});

app.listen(PORT, () => console.log(`Hardened Login Module running at http://localhost:${PORT}`));
