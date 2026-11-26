// INSECURE EXAMPLE FOR ANALYSIS ONLY - DO NOT DEPLOY
const express = require('express');
const app = express();
app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // FLAW 1: String concatenation allows SQL Injection (' OR 1=1 --)
    const unsafeQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('Executing unsafe query:', unsafeQuery);
    res.send('Vulnerable endpoint demonstration');
});
