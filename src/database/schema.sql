-- HR & Employee Management System Database Schema
-- MariaDB / MySQL Database
-- Run this script on your AWS Ubuntu MariaDB server

CREATE DATABASE IF NOT EXISTS hr_management;
USE hr_management;

-- ==================== HR Admin Table ====================
CREATE TABLE IF NOT EXISTS hr_admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================== Employees Table ====================
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  emp_id VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  date_of_birth DATE NULL,
  address TEXT,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  manager_name VARCHAR(200) DEFAULT '',
  doj DATE NOT NULL,
  employment_type ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern') DEFAULT 'Full-Time',
  probation_period VARCHAR(50) DEFAULT '',
  confirmation_date DATE NULL,
  work_location VARCHAR(200) DEFAULT '',
  shift_timing VARCHAR(100) DEFAULT '',
  salary_package VARCHAR(100) DEFAULT '',
  bank_account_number VARCHAR(50) DEFAULT '',
  ifsc_code VARCHAR(20) DEFAULT '',
  pan_number VARCHAR(20) DEFAULT '',
  aadhaar_number VARCHAR(20) DEFAULT '',
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_photo TEXT DEFAULT '',
  status ENUM('active', 'inactive', 'on_probation') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_status (status),
  INDEX idx_emp_id (emp_id)
);

-- ==================== Leaves Table ====================
CREATE TABLE IF NOT EXISTS leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  leave_type ENUM('CL') DEFAULT 'CL',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by VARCHAR(100) NULL,
  cancelled_at TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);

-- ==================== Leave Balance Table ====================
CREATE TABLE IF NOT EXISTS leave_balance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  total_cl INT DEFAULT 2,
  used_cl INT DEFAULT 0,
  remaining_cl INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY uk_employee_month_year (employee_id, month, year),
  INDEX idx_month_year (month, year)
);

-- ==================== Holidays Table ====================
CREATE TABLE IF NOT EXISTS holidays (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  type ENUM('national', 'religious', 'company', 'optional') NOT NULL,
  day VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== Announcements Table ====================
CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('general', 'policy', 'event', 'celebration', 'important', 'update') DEFAULT 'general',
  date DATE NOT NULL,
  priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
  author VARCHAR(200) DEFAULT 'HR Admin',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== Notifications Table ====================
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_role ENUM('hr', 'employee') NOT NULL,
  type ENUM('leave_applied', 'leave_approved', 'leave_rejected', 'leave_cancelled', 'announcement') NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  related_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_role),
  INDEX idx_read (is_read)
);

-- ==================== Attendance Table ====================
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  emp_id VARCHAR(20) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  check_in VARCHAR(20) NULL,
  check_out VARCHAR(20) NULL,
  check_in_location VARCHAR(500) DEFAULT 'Unknown',
  check_out_location VARCHAR(500) NULL,
  status ENUM('present', 'late', 'absent') DEFAULT 'present',
  hours DECIMAL(4,1) DEFAULT 0,
  is_auto TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_date (employee_id, date),
  INDEX idx_date (date)
);

-- ==================== Performance Goals Table ====================
CREATE TABLE IF NOT EXISTS performance_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(300) NOT NULL,
  description TEXT DEFAULT '',
  progress INT DEFAULT 0,
  status ENUM('on_track', 'at_risk', 'completed', 'not_started') DEFAULT 'not_started',
  due_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  assigned_by VARCHAR(200) DEFAULT 'HR Admin',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  employee_id VARCHAR(20) NOT NULL,
  INDEX idx_employee (employee_id)
);

-- ==================== Performance Feedback Table ====================
CREATE TABLE IF NOT EXISTS performance_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_person VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  date DATE NOT NULL,
  type ENUM('praise', 'constructive', 'general') DEFAULT 'general',
  employee_id VARCHAR(20) NOT NULL,
  INDEX idx_employee (employee_id)
);

-- ==================== Performance Skills Table ====================
CREATE TABLE IF NOT EXISTS performance_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  skill VARCHAR(200) NOT NULL,
  rating INT DEFAULT 3,
  max_rating INT DEFAULT 5,
  employee_id VARCHAR(20) NOT NULL,
  UNIQUE KEY uk_skill_employee (skill, employee_id),
  INDEX idx_employee (employee_id)
);

-- ==================== Seed Default Data ====================

-- Seed HR Admin (Password: hrcodeoriginai@1234 - bcrypt hashed)
INSERT INTO hr_admin (username, password) VALUES (
  'codeorigin',
  '$2a$12$LQv3c1yqBo9SkvXS7QTJPOoGz2EzfLzG0M8LcHqOqK5F5GqHu5Vqa'
) ON DUPLICATE KEY UPDATE username = username;

-- Seed Default Holidays
INSERT INTO holidays (name, date, type, day) VALUES
  ("New Year's Day", '2025-01-01', 'national', 'Wednesday'),
  ('Republic Day', '2025-01-26', 'national', 'Sunday'),
  ('Holi', '2025-03-14', 'religious', 'Friday'),
  ('Good Friday', '2025-04-18', 'religious', 'Friday'),
  ('May Day', '2025-05-01', 'national', 'Thursday'),
  ('Company Foundation Day', '2025-05-15', 'company', 'Thursday'),
  ('Independence Day', '2025-08-15', 'national', 'Friday'),
  ('Ganesh Chaturthi', '2025-08-27', 'religious', 'Wednesday'),
  ('Gandhi Jayanti', '2025-10-02', 'national', 'Thursday'),
  ('Dussehra', '2025-10-02', 'religious', 'Thursday'),
  ('Diwali', '2025-10-21', 'religious', 'Tuesday'),
  ('Diwali (Day 2)', '2025-10-22', 'religious', 'Wednesday'),
  ('Christmas', '2025-12-25', 'religious', 'Thursday'),
  ('Year End Break', '2025-12-31', 'company', 'Wednesday'),
  ('Eid ul-Fitr', '2025-03-31', 'optional', 'Monday'),
  ('Raksha Bandhan', '2025-08-09', 'optional', 'Saturday')
ON DUPLICATE KEY UPDATE name = name;
