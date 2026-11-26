IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'employee_db_p8')
BEGIN
    CREATE DATABASE employee_db_p8;
END
GO

USE employee_db_p8;
GO

IF OBJECT_ID('employees', 'U') IS NULL
BEGIN
    CREATE TABLE employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        emp_code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        designation VARCHAR(60) NOT NULL,
        department VARCHAR(50) NOT NULL,
        salary DECIMAL(10,2) NOT NULL
    );
END
GO

INSERT INTO employees (emp_code, name, designation, department, salary) VALUES
('EMP01', 'Rohan Mehta', 'Backend Engineer', 'Engineering', 75000.00),
('EMP02', 'Sneha Joshi', 'UI/UX Designer', 'Design', 62000.00),
('EMP03', 'Vikram Rao', 'HR Manager', 'Human Resources', 68000.00);
GO
