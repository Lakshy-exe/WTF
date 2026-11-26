const express = require("express");
const sql = require("mssql/msnodesqlv8");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const dbConfig = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=techmart;Trusted_Connection=yes;TrustServerCertificate=yes;"
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("SQL Server connected successfully!");
        return pool;
    })
    .catch(err => console.error("DB Error:", err));

// READ
app.get("/api/products", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM products ORDER BY id DESC");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Unable to fetch products" });
    }
});

// CREATE
app.post("/api/products", async (req, res) => {
    const { name, category, price, quantity, description } = req.body;
    if (!name || !category || price === undefined || quantity === undefined) {
        return res.status(400).json({ message: "Please fill all required fields." });
    }
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("name", sql.VarChar(100), name.trim())
            .input("category", sql.VarChar(50), category.trim())
            .input("price", sql.Decimal(10, 2), Number(price))
            .input("quantity", sql.Int, Number(quantity))
            .input("description", sql.VarChar(255), description ? description.trim() : "")
            .query("INSERT INTO products (name, category, price, quantity, description) VALUES (@name, @category, @price, @quantity, @description); SELECT SCOPE_IDENTITY() AS id;");
        res.status(201).json({ message: "Product added successfully.", id: result.recordset[0].id });
    } catch (err) {
        res.status(500).json({ message: "Product could not be added." });
    }
});

// UPDATE
app.put("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, category, price, quantity, description } = req.body;
    if (!id || !name || !category || price === undefined || quantity === undefined) {
        return res.status(400).json({ message: "Invalid product data." });
    }
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("name", sql.VarChar(100), name.trim())
            .input("category", sql.VarChar(50), category.trim())
            .input("price", sql.Decimal(10, 2), Number(price))
            .input("quantity", sql.Int, Number(quantity))
            .input("description", sql.VarChar(255), description ? description.trim() : "")
            .query("UPDATE products SET name = @name, category = @category, price = @price, quantity = @quantity, description = @description WHERE id = @id");
        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: "Product not found." });
        res.json({ message: "Product updated successfully." });
    } catch (err) {
        res.status(500).json({ message: "Update failed." });
    }
});

// DELETE
app.delete("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid product ID." });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM products WHERE id = @id");
        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: "Product not found." });
        res.json({ message: "Product deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Delete failed." });
    }
});

app.listen(PORT, () => console.log(`TechMart running at http://localhost:${PORT}`));