const express = require('express');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = 3083;

app.use(express.json());
app.use(express.static(__dirname));

const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=library_db_p8;Trusted_Connection=yes;TrustServerCertificate=yes;"
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to library_db_p8 (MSSQL)');
        return pool;
    })
    .catch(err => console.error('DB Error:', err));

app.get('/api/books', async (req, res) => {
    const search = (req.query.search || '').trim();
    try {
        const pool = await poolPromise;
        if (search) {
            const result = await pool.request()
                .input('q', sql.VarChar(150), `%${search}%`)
                .query('SELECT * FROM books WHERE title LIKE @q OR author LIKE @q OR isbn LIKE @q ORDER BY id DESC');
            return res.json(result.recordset);
        }
        const result = await pool.request().query('SELECT * FROM books ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve books.' });
    }
});

app.post('/api/books', async (req, res) => {
    const { isbn, title, author, genre, copies } = req.body;
    if (!isbn || !title || !author || !genre || Number(copies) < 0) {
        return res.status(400).json({ message: 'Please provide valid book details.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('isbn', sql.VarChar(30), isbn.trim())
            .input('title', sql.VarChar(150), title.trim())
            .input('author', sql.VarChar(100), author.trim())
            .input('genre', sql.VarChar(50), genre.trim())
            .input('copies', sql.Int, Number(copies))
            .query('INSERT INTO books (isbn, title, author, genre, copies) VALUES (@isbn, @title, @author, @genre, @copies)');
        res.status(201).json({ message: 'Book added to catalog.' });
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ message: 'A book with this ISBN already exists.' });
        }
        res.status(500).json({ message: 'Error adding book.' });
    }
});

app.put('/api/books/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { isbn, title, author, genre, copies } = req.body;
    if (!id || !isbn || !title || !author || !genre || Number(copies) < 0) {
        return res.status(400).json({ message: 'Invalid book details.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('isbn', sql.VarChar(30), isbn.trim())
            .input('title', sql.VarChar(150), title.trim())
            .input('author', sql.VarChar(100), author.trim())
            .input('genre', sql.VarChar(50), genre.trim())
            .input('copies', sql.Int, Number(copies))
            .query('UPDATE books SET isbn=@isbn, title=@title, author=@author, genre=@genre, copies=@copies WHERE id=@id');
        res.json({ message: 'Book record updated.' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating book.' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, id).query('DELETE FROM books WHERE id=@id');
        res.json({ message: 'Book removed from catalog.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting book.' });
    }
});

app.listen(PORT, () => console.log(`Library Book System running at http://localhost:${PORT}`));
