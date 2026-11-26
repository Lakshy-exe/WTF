const express = require('express');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = 3081;

app.use(express.json());
app.use(express.static(__dirname));

const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=student_db_p8;Trusted_Connection=yes;TrustServerCertificate=yes;"
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to student_db_p8 (MSSQL)');
        return pool;
    })
    .catch(err => console.error('DB Error:', err));

app.get('/api/students', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM students ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch student records.' });
    }
});

app.post('/api/students', async (req, res) => {
    const { roll_no, full_name, department, semester, email } = req.body;
    if (!roll_no || !full_name || !department || !semester || !email || !email.includes('@')) {
        return res.status(400).json({ message: 'Please provide valid student details and email.' });
    }
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('roll_no', sql.VarChar(20), roll_no.trim())
            .input('full_name', sql.VarChar(100), full_name.trim())
            .input('department', sql.VarChar(50), department.trim())
            .input('semester', sql.Int, Number(semester))
            .input('email', sql.VarChar(100), email.trim())
            .query('INSERT INTO students (roll_no, full_name, department, semester, email) VALUES (@roll_no, @full_name, @department, @semester, @email); SELECT SCOPE_IDENTITY() AS id;');
        res.status(201).json({ message: 'Student added successfully.', id: result.recordset[0].id });
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ message: 'Roll number already exists.' });
        }
        res.status(500).json({ message: 'Error adding student record.' });
    }
});

app.put('/api/students/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { roll_no, full_name, department, semester, email } = req.body;
    if (!id || !roll_no || !full_name || !department || !semester || !email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid student data.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('roll_no', sql.VarChar(20), roll_no.trim())
            .input('full_name', sql.VarChar(100), full_name.trim())
            .input('department', sql.VarChar(50), department.trim())
            .input('semester', sql.Int, Number(semester))
            .input('email', sql.VarChar(100), email.trim())
            .query('UPDATE students SET roll_no=@roll_no, full_name=@full_name, department=@department, semester=@semester, email=@email WHERE id=@id');
        res.json({ message: 'Student updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating student record.' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, id).query('DELETE FROM students WHERE id=@id');
        res.json({ message: 'Student deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student record.' });
    }
});

app.listen(PORT, () => console.log(`Student Info System running at http://localhost:${PORT}`));
