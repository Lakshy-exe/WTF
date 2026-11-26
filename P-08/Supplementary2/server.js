const express = require('express');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = 3082;

app.use(express.json());
app.use(express.static(__dirname));

const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=employee_db_p8;Trusted_Connection=yes;TrustServerCertificate=yes;"
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to employee_db_p8 (MSSQL)');
        return pool;
    })
    .catch(err => console.error('DB Error:', err));

app.get('/api/employees', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM employees ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load employees.' });
    }
});

app.post('/api/employees', async (req, res) => {
    const { emp_code, name, designation, department, salary } = req.body;
    if (!emp_code || !name || !designation || !department || Number(salary) <= 0) {
        return res.status(400).json({ message: 'Please provide valid employee details.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('emp_code', sql.VarChar(20), emp_code.trim())
            .input('name', sql.VarChar(100), name.trim())
            .input('designation', sql.VarChar(60), designation.trim())
            .input('department', sql.VarChar(50), department.trim())
            .input('salary', sql.Decimal(10, 2), Number(salary))
            .query('INSERT INTO employees (emp_code, name, designation, department, salary) VALUES (@emp_code, @name, @designation, @department, @salary)');
        res.status(201).json({ message: 'Employee added successfully.' });
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ message: 'Employee code already exists.' });
        }
        res.status(500).json({ message: 'Error adding employee.' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { emp_code, name, designation, department, salary } = req.body;
    if (!id || !emp_code || !name || !designation || !department || Number(salary) <= 0) {
        return res.status(400).json({ message: 'Invalid employee update data.' });
    }
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('emp_code', sql.VarChar(20), emp_code.trim())
            .input('name', sql.VarChar(100), name.trim())
            .input('designation', sql.VarChar(60), designation.trim())
            .input('department', sql.VarChar(50), department.trim())
            .input('salary', sql.Decimal(10, 2), Number(salary))
            .query('UPDATE employees SET emp_code=@emp_code, name=@name, designation=@designation, department=@department, salary=@salary WHERE id=@id');
        res.json({ message: 'Employee updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating employee.' });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, id).query('DELETE FROM employees WHERE id=@id');
        res.json({ message: 'Employee deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting employee.' });
    }
});

app.listen(PORT, () => console.log(`Employee Management System running at http://localhost:${PORT}`));
