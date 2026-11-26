const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3002;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'emp_attendance_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

const EMPLOYEES = [
    {
        empId: 'EMP101',
        username: 'emp101',
        password: 'password123',
        name: 'Rohan Mehta',
        department: 'Software Engineering',
        role: 'Full-Stack Developer',
        email: 'rohan.mehta@techcorp.in'
    }
];

let attendanceRecords = [
    { empId: 'EMP101', date: '2026-11-24', checkIn: '09:05 AM', status: 'Present' },
    { empId: 'EMP101', date: '2026-11-25', checkIn: '08:58 AM', status: 'Present' }
];

function requireEmployeeAuth(req, res, next) {
    if (req.session && req.session.employee) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.redirect('/login');
}

app.get('/', (req, res) => {
    if (req.session && req.session.employee) return res.redirect('/dashboard');
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const emp = EMPLOYEES.find(e => e.username === username && e.password === password);
    if (!emp) {
        return res.redirect('/login?error=1');
    }
    req.session.employee = emp;
    res.redirect('/dashboard');
});

app.get('/dashboard', requireEmployeeAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', requireEmployeeAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/api/profile', requireEmployeeAuth, (req, res) => {
    res.json(req.session.employee);
});

app.get('/api/attendance', requireEmployeeAuth, (req, res) => {
    const logs = attendanceRecords.filter(r => r.empId === req.session.employee.empId);
    res.json(logs);
});

app.post('/api/attendance/checkin', requireEmployeeAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const exists = attendanceRecords.find(r => r.empId === req.session.employee.empId && r.date === today);

    if (exists) {
        return res.status(400).json({ message: 'Attendance already marked for today!' });
    }

    const record = { empId: req.session.employee.empId, date: today, checkIn: timeNow, status: 'Present' };
    attendanceRecords.push(record);
    res.status(201).json({ message: 'Checked in successfully!', record });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login?loggedout=1');
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Employee Attendance Portal running at http://localhost:${PORT}`);
});
