const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3003;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'hotel_reservation_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

const GUESTS = [
    { username: 'guest1', password: 'hotel123', fullName: 'Priya Desai', phone: '+91 98250 11223' }
];

let bookings = [];

function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.guest) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Please log in to book rooms.' });
    }
    res.redirect('/login');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    if (req.session && req.session.guest) return res.redirect('/booking');
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const guest = GUESTS.find(g => g.username === username && g.password === password);
    if (!guest) {
        return res.redirect('/login?error=1');
    }
    req.session.guest = guest;
    res.redirect('/booking');
});

// Protected Booking Page
app.get('/booking', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/api/bookings', ensureAuthenticated, (req, res) => {
    const userBookings = bookings.filter(b => b.username === req.session.guest.username);
    res.json({ guest: req.session.guest, bookings: userBookings });
});

app.post('/api/bookings', ensureAuthenticated, (req, res) => {
    const { roomType, checkIn, nights } = req.body;
    if (!roomType || !checkIn || !nights || Number(nights) < 1) {
        return res.status(400).json({ message: 'Please provide valid booking details.' });
    }
    const rates = { 'Deluxe Room': 3500, 'Executive Suite': 6000, 'Presidential Suite': 11000 };
    const total = (rates[roomType] || 3500) * Number(nights);

    const newBooking = {
        bookingId: 'BK' + Math.floor(1000 + Math.random() * 9000),
        username: req.session.guest.username,
        guestName: req.session.guest.fullName,
        roomType,
        checkIn,
        nights: Number(nights),
        total
    };
    bookings.push(newBooking);
    res.status(201).json({ message: 'Room reserved successfully!', booking: newBooking });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login?loggedout=1');
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Hotel Reservation Portal running at http://localhost:${PORT}`);
});
