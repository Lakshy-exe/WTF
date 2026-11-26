const express = require('express');
const sql = require('mssql/msnodesqlv8');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// Connects directly using Windows Authentication (no SQL password needed)
const dbConfig = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=techmart_p12;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to Microsoft SQL Server via Windows Auth!');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed:', err);
        process.exit(1);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'techmart_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) return next();
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    res.redirect('/login.html');
}

app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/index.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Register
app.post('/api/register', async (req, res) => {
    try {
        const username = (req.body.username || '').trim();
        const password = req.body.password || '';

        if (username.length < 3 || password.length < 6) {
            return res.status(400).json({ error: 'Username (min 3 chars) and password (min 6 chars) required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;

        await pool.request()
            .input('username', sql.VarChar(50), username)
            .input('password_hash', sql.VarChar(255), hashedPassword)
            .query('INSERT INTO users (username, password_hash) VALUES (@username, @password_hash)');

        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const username = (req.body.username || '').trim();
        const password = req.body.password || '';
        const pool = await poolPromise;

        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
            .query('SELECT * FROM users WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ message: 'Login successful', username: user.username });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

app.get('/api/user', isAuthenticated, (req, res) => {
    res.json({ username: req.session.username });
});

// READ Products
app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM products ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});

// CREATE Product
app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
        const name = (req.body.name || '').trim();
        const category = (req.body.category || '').trim();
        const price = parseFloat(req.body.price);
        const quantity = parseInt(req.body.quantity, 10);

        if (!name || !category || isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ error: 'Invalid product details provided.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.VarChar(100), name)
            .input('category', sql.VarChar(50), category)
            .input('price', sql.Decimal(10, 2), price)
            .input('quantity', sql.Int, quantity)
            .query('INSERT INTO products (name, category, price, quantity) OUTPUT INSERTED.id VALUES (@name, @category, @price, @quantity)');

        res.status(201).json({ id: result.recordset[0].id, message: 'Product added successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error while adding product.' });
    }
});

// UPDATE Product
app.put('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const name = (req.body.name || '').trim();
        const category = (req.body.category || '').trim();
        const price = parseFloat(req.body.price);
        const quantity = parseInt(req.body.quantity, 10);

        if (!name || !category || isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ error: 'Invalid update values.' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.VarChar(100), name)
            .input('category', sql.VarChar(50), category)
            .input('price', sql.Decimal(10, 2), price)
            .input('quantity', sql.Int, quantity)
            .query('UPDATE products SET name = @name, category = @category, price = @price, quantity = @quantity WHERE id = @id');

        res.json({ message: 'Product updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error while updating product.' });
    }
});

// DELETE Product
app.delete('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM products WHERE id = @id');

        res.json({ message: 'Product deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error while deleting product.' });
    }
});

app.listen(PORT, () => {
    console.log(`TechMart Server running at http://localhost:${PORT}`);
});

// CREATE Product
app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
        const name = (req.body.name || '').trim();
        const category = (req.body.category || '').trim();
        const price = parseFloat(req.body.price);
        const quantity = parseInt(req.body.quantity, 10);

        if (!name || !category || isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ error: 'Invalid product details provided.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.VarChar(100), name)
            .input('category', sql.VarChar(50), category)
            .input('price', sql.Decimal(10, 2), price)
            .input('quantity', sql.Int, quantity)
            .query('INSERT INTO products (name, category, price, quantity) VALUES (@name, @category, @price, @quantity); SELECT SCOPE_IDENTITY() AS id;');

        res.status(201).json({ id: result.recordset[0].id, message: 'Product added successfully!' });
    } catch (err) {
        console.error('ADD PRODUCT ERROR:', err);
        res.status(500).json({ error: err.message || 'Database error while adding product.' });
    }
});