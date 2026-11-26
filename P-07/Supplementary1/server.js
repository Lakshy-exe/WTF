const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'course_portal_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Predefined student credentials
const STUDENTS = [
    { username: 'student1', password: 'pass123', name: 'Aarav Sharma', enrollment: '26IT001' },
    { username: 'lakshy', password: 'charusat123', name: 'Lakshy Patel', enrollment: '26IT042' }
];

// Middleware to protect course material routes
function requireAuth(req, res, next) {
    if (req.session && req.session.student) {
        return next();
    }
    res.redirect('/login');
}

// Public Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
    if (req.session && req.session.student) {
        return res.redirect('/courses');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const student = STUDENTS.find(s => s.username === username && s.password === password);

    if (!student) {
        return res.redirect('/login?error=1');
    }

    req.session.student = {
        username: student.username,
        name: student.name,
        enrollment: student.enrollment
    };
    res.redirect('/courses');
});

// Protected Course Materials Route
app.get('/courses', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'courses.html'));
});

// API endpoint to get logged-in student details
app.get('/api/me', requireAuth, (req, res) => {
    res.json(req.session.student);
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login?loggedout=1');
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Online Course Portal running at http://localhost:${PORT}`);
});
