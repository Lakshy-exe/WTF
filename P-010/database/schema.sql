-- ===========================================================
--  FinSecure Solutions Pvt. Ltd. — Security Practical (WTF-10)
--  Database Schema — MICROSOFT SQL SERVER (T-SQL) VERSION
--  Run this in SQL Server Management Studio (SSMS) before
--  starting either app. Execute the whole script with
--  "Execute" (F5) — the GO statements separate it into batches.
-- ===========================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'finsecure_demo')
BEGIN
    CREATE DATABASE finsecure_demo;
END
GO

USE finsecure_demo;
GO

-- ---------------------------------------------------------
-- Table used ONLY by the VULNERABLE DEMO (controlled sandbox)
-- Password is stored in PLAIN TEXT on purpose, to demonstrate
-- WHY this is a serious security flaw. Never do this in real
-- applications — see secure_users table below for the fix.
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

CREATE TABLE dbo.users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,          -- INSECURE: plain text (demo only)
  created_at DATETIME DEFAULT GETDATE()
);
GO

-- One seeded demo account: admin / admin123
INSERT INTO dbo.users (username, password) VALUES ('admin', 'admin123');
GO

-- ---------------------------------------------------------
-- Comments table — shared by both demos for the XSS example
-- (vulnerable-demo renders this unescaped; secure-app escapes it)
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.comments', 'U') IS NOT NULL DROP TABLE dbo.comments;
GO

CREATE TABLE dbo.comments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  author VARCHAR(50) NOT NULL,
  content VARCHAR(MAX) NOT NULL,
  created_at DATETIME DEFAULT GETDATE()
);
GO

-- ---------------------------------------------------------
-- Table used ONLY by the SECURE APP
-- Passwords are stored as bcrypt HASHES, never plain text.
-- failed_attempts / locked_until support basic brute-force
-- lockout (defensive programming).
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.secure_users', 'U') IS NOT NULL DROP TABLE dbo.secure_users;
GO

CREATE TABLE dbo.secure_users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  failed_attempts INT DEFAULT 0,
  locked_until DATETIME NULL,
  created_at DATETIME DEFAULT GETDATE()
);
GO
