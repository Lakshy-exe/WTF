IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'student_db_p8')
BEGIN
    CREATE DATABASE student_db_p8;
END
GO

USE student_db_p8;
GO

IF OBJECT_ID('students', 'U') IS NULL
BEGIN
    CREATE TABLE students (
        id INT IDENTITY(1,1) PRIMARY KEY,
        roll_no VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        semester INT NOT NULL,
        email VARCHAR(100) NOT NULL
    );
END
GO

INSERT INTO students (roll_no, full_name, department, semester, email) VALUES
('26IT001', 'Aarav Patel', 'Information Technology', 1, 'aarav.patel@charusat.edu.in'),
('26CE014', 'Diya Shah', 'Computer Engineering', 3, 'diya.shah@charusat.edu.in'),
('26EC029', 'Kabir Desai', 'Electronics & Comm', 5, 'kabir.desai@charusat.edu.in');
GO
