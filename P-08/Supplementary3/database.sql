IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'library_db_p8')
BEGIN
    CREATE DATABASE library_db_p8;
END
GO

USE library_db_p8;
GO

IF OBJECT_ID('books', 'U') IS NULL
BEGIN
    CREATE TABLE books (
        id INT IDENTITY(1,1) PRIMARY KEY,
        isbn VARCHAR(30) NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        author VARCHAR(100) NOT NULL,
        genre VARCHAR(50) NOT NULL,
        copies INT NOT NULL
    );
END
GO

INSERT INTO books (isbn, title, author, genre, copies) VALUES
('978-0132350884', 'Clean Code', 'Robert C. Martin', 'Software Engineering', 7),
('978-0201633610', 'Design Patterns', 'Erich Gamma', 'Computer Science', 4),
('978-0596517748', 'JavaScript: The Good Parts', 'Douglas Crockford', 'Web Development', 9);
GO
