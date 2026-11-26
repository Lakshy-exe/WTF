const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3022;

app.use(express.json());
app.use(express.static(__dirname));

const registeredUsers = [];

// Strong password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/register', async (req, res) => {
    try {
        const username = (req.body.username || '').trim();
        const email = (req.body.email || '').trim().toLowerCase();
        const password = req.body.password || '';

        if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters.' });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }
        if (!STRONG_PASSWORD.test(password)) {
            return res.status(400).json({
                error: 'Password must be 8+ chars with uppercase, lowercase, number, and special character (@$!%*?&).'
            });
        }
        if (registeredUsers.some(u => u.username === username || u.email === email)) {
            return res.status(409).json({ error: 'An account with this username or email already exists.' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        registeredUsers.push({ id: registeredUsers.length + 1, username, email, passwordHash });

        res.status(201).json({
            message: 'User registered securely!',
            storedRecord: { username, email, passwordHash }
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

app.listen(PORT, () => console.log(`Secure Registration App running at http://localhost:${PORT}`));
