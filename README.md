# Student Information Management System (SIMS)

## System Description

The Student Information Management System (SIMS) is a role-based web-based system designed to manage and organize school records efficiently. It has three user roles: Administrator, Teacher, and Student.

---

## User Roles

### Administrator

* Manage users (teachers and students)
* Manage subjects, sections, and system data
* View reports and system overview

### Teacher

* Manage student records
* Record and update attendance
* Manage grades
* View class schedules

### Student

* View personal profile
* View grades and attendance
* View class schedule
* Access announcements and updates

---

## Default Login Credentials

### Admin

Username: admin
Password: admin123

### Teacher

Username: teacher1
Password: teacher123

### Student

Username: student1
Password: student123

---

## System Requirements

* XAMPP (Apache & MySQL)
* Node.js
* npm (Node Package Manager)
* Web Browser (Chrome recommended)

---

## Database Setup

1. Open phpMyAdmin
2. Create database: `cabacao_sims`
3. Import SQL file: `cabacao_sims (2).sql`

---

## Run Instructions

### Frontend

```
npm install
npm start
```

### Backend

* Start Apache and MySQL in XAMPP
* Ensure database connection is configured in `database.php`

---

## Notes

* Make sure XAMPP is running before accessing the system
* Do not modify core files unless necessary
* Ensure database is properly imported before login
