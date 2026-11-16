const express = require("express");
const session = require("express-session");

const app = express();
const PORT = 3000;

// -------------------------
// Middleware
// -------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// -------------------------
// Session
// -------------------------
app.use(
    session({
        secret: "central-city-library-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true
        }
    })
);

// -------------------------
// Helper Layout for Styled Responses
// -------------------------
function renderPage(title, content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Central City Library</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f0f2f5;
                color: #1f2937;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
            }
            .card {
                background: #ffffff;
                width: 100%;
                max-width: 550px;
                padding: 32px;
                border-radius: 10px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
            }
            nav {
                display: flex;
                gap: 16px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 14px;
                margin-bottom: 24px;
            }
            nav a {
                text-decoration: none;
                color: #2563eb;
                font-weight: 600;
            }
            nav a.danger {
                margin-left: auto;
                color: #dc2626;
            }
            h1 { margin-top: 0; color: #111827; }
            h2 { color: #374151; font-size: 1.2rem; }
            p, li { line-height: 1.6; color: #4b5563; }
            .form-group { margin-bottom: 16px; }
            label { display: block; margin-bottom: 6px; font-weight: 600; }
            input {
                width: 100%;
                padding: 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                box-sizing: border-box;
                font-size: 15px;
            }
            button, .btn {
                display: inline-block;
                background-color: #2563eb;
                color: #ffffff;
                padding: 10px 18px;
                border: none;
                border-radius: 6px;
                text-decoration: none;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
            }
            button:hover, .btn:hover { background-color: #1d4ed8; }
            .hint {
                margin-top: 20px;
                padding: 12px;
                background: #f8fafc;
                border-left: 4px solid #2563eb;
                font-size: 14px;
            }
            .badge {
                display: inline-block;
                background: #dcfce7;
                color: #166534;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 13px;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="card">
            ${content}
        </div>
    </body>
    </html>
    `;
}

// -------------------------
// Authentication Middleware
// -------------------------
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}

// -------------------------
// Home
// -------------------------
app.get("/", (req, res) => {
    res.send(renderPage("Home", `
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
        </nav>
        <h1>Central City Library</h1>
        <p>Welcome to the Library Portal.</p>
        <a href="/login" class="btn">Login to Portal</a>
    `));
});

// -------------------------
// About
// -------------------------
app.get("/about", (req, res) => {
    res.send(renderPage("About", `
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
        </nav>
        <h1>About Central City Library</h1>
        <p>Central City Library provides educational resources for students and staff.</p>
        <ul>
            <li>Books</li>
            <li>Digital Library</li>
            <li>Research Papers</li>
            <li>Online Journals</li>
        </ul>
    `));
});

// -------------------------
// Login Page
// -------------------------
app.get("/login", (req, res) => {
    res.send(renderPage("Login", `
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
        </nav>
        <h1>Member Login</h1>
        <form action="/login" method="POST">
            <div class="form-group">
                <label>Username:</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <div class="hint">
            <strong>Credentials:</strong> Username: <code>student</code> | Password: <code>12345</code>
        </div>
    `));
});

// -------------------------
// Login Processing
// -------------------------
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "student" && password === "12345") {
        req.session.user = {
            username: username,
            role: "member"
        };
        res.redirect("/dashboard");
    } else {
        res.send(renderPage("Login Failed", `
            <h1>Login Failed</h1>
            <p>Invalid username or password.</p>
            <a href="/login" class="btn">Try Again</a>
        `));
    }
});

// -------------------------
// Protected Dashboard
// -------------------------
app.get("/dashboard", isAuthenticated, (req, res) => {
    const user = req.session.user;

    res.send(renderPage("Dashboard", `
        <nav>
            <a href="/dashboard">Dashboard</a>
            <a href="/profile">Profile</a>
            <a href="/logout" class="danger">Logout</a>
        </nav>
        <h1>Library Dashboard</h1>
        <h2>Welcome, ${user.username} <span class="badge">Authenticated</span></h2>
        <p>Authentication successful.</p>
        <h3>Library Resources</h3>
        <ul>
            <li>Digital Books</li>
            <li>Research Papers</li>
            <li>Online Journals</li>
        </ul>
    `));
});

// -------------------------
// Profile
// -------------------------
app.get("/profile", isAuthenticated, (req, res) => {
    const user = req.session.user;

    res.send(renderPage("Profile", `
        <nav>
            <a href="/dashboard">Dashboard</a>
            <a href="/profile">Profile</a>
            <a href="/logout" class="danger">Logout</a>
        </nav>
        <h1>Member Profile</h1>
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Role:</strong> ${user.role}</p>
    `));
});

// -------------------------
// Logout
// -------------------------
app.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).send("Logout failed.");
        }
        res.redirect("/login");
    });
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});