# Clinic-Flow Service

Clinic-Flow is a Node.js + Express + MySQL backend for managing doctors, patients, and appointments.
It uses JWT for authentication and supports role-based access for **patients** and **doctors**.

---

## ✨ Features
- JWT authentication (login/sign-up)
- Role-based access control (`doctor`, `patient`)
- Patients: view/search doctors, request appointments
- Doctors: view requests, approve/reject (future-dated only)
- Results ordered by **newest appointments first**

---

## 🧰 Tech Stack
- **Node.js** + **Express**
- **MySQL**
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT)

---

## ⚙️ Setup & Run

### 1) Clone & Install
```bash
git clone https://github.com/your-username/clinic-flow.git
cd clinic-flow
npm install
```

### 2) Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=clinic_flow
JWT_SECRET=your_jwt_secret
```

### 3) Start Server
```bash
npm start
```
Server runs on `http://localhost:3000` by default.

---

## 🗄 Database Schema (MySQL)

> IDs are `AUTO_INCREMENT`. Appointments cascade delete when a doctor/patient is removed.

```sql
-- doctors
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,       -- store hashed passwords
  specialization VARCHAR(100) NOT NULL
);

-- patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,       -- store hashed passwords
  age INT NULL,
  gender ENUM('male','female','other') NULL
);

-- appointments
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

---

## 🔐 Authentication

All protected endpoints require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

- Tokens are issued on successful **/auth/login**.
- The token payload includes: `{ id, role }`.

---

## 📚 API Reference

### Auth

#### 1) Sign Up (Doctor/Patient)
`POST /auth/signup`

Request (Doctor):
```json
{
  "role": "doctor",
  "name": "Dr. Smith",
  "email": "smith@example.com",
  "password": "secret123",
  "specialization": "Cardiology"
}
```

Request (Patient):
```json
{
  "role": "patient",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "age": 30,
  "gender": "male"
}
```

Success:
```json
{ "message": "Signup successful", "id": 7 }
```

Errors:
- 400 on missing fields / invalid role
- 409 on duplicate email

---

#### 2) Login
`POST /auth/login`

Request:
```json
{
  "email": "smith@example.com",
  "password": "secret123",
  "role": "doctor"
}
```

Success:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi..."
}
```

Errors:
- 401 on invalid credentials

---

### Doctors (Patient Access) 'api/p'

#### 3) Get All Doctors (Newest First)
`GET /doctors`

Notes:
- Requires **patient** token.
- Returns doctors ordered by **id DESC** (newest entries first).

Success:
```json
[
  { "id": 5, "name": "Dr. Alice", "email": "alice@ex.com", "specialization": "Dermatology" },
  { "id": 3, "name": "Dr. Bob", "email": "bob@ex.com", "specialization": "Pediatrics" }
]
```

---

#### 4) Search Doctors by Name/Specialization
`GET /doctors/search?q=cardio`

Notes:
- Requires **patient** token.
- Performs `LIKE` search on `name` and `specialization`.

Success:
```json
[
  { "id": 2, "name": "Dr. Smith", "email": "smith@ex.com", "specialization": "Cardiology" }
]
```

---

### Appointments

#### 5) Request Appointment (Patient)
`POST /appointment`

Headers:
```
Authorization: Bearer <patient_token>
Content-Type: application/json
```

Request:
```json
{
  "doctor_id": 2,
  "appointment_date": "2025-08-20 09:00:00",
  "reason": "General checkup"
}
```

Rules:
- `appointment_date` must be **in the future** (`> NOW()`).
- Stored as MySQL `DATETIME` (format: `YYYY-MM-DD HH:MM:SS`).

Success:
```json
{ "message": "Appointment request sent", "id": 12 }
```

Errors:
- 400 on missing fields or past date

---

#### 6) Patient: View My Appointments (Newest First)
`GET /my-appointments`

Headers:
```
Authorization: Bearer <patient_token>
```

Success:
```json
[
  {
    "id": 12,
    "doctor_name": "Dr. Smith",
    "specialization": "Cardiology",
    "doctor_email": "smith@ex.com",
    "appointment_date": "2025-08-20 09:00:00",
    "reason": "General checkup",
    "status": "pending"
  }
]
```

---

#### 7) Doctor: View My Appointments (Newest First) 'api/d'
`GET /appointments`

Headers:
```
Authorization: Bearer <doctor_token>
```

Success:
```json
[
  {
    "id": 12,
    "patient_name": "John Doe",
    "patient_email": "john@ex.com",
    "appointment_date": "2025-08-20 09:00:00",
    "reason": "General checkup",
    "status": "pending"
  }
]
```

---

#### 8) Approve Appointment (Doctor, Future Only)
`PUT /appointments/:id/approve`

Headers:
```
Authorization: Bearer <doctor_token>
```

Logic:
```sql
UPDATE appointments
SET status = 'approved'
WHERE id = ? AND doctor_id = ? AND appointment_date > NOW();
```

Success:
```json
{ "message": "Appointment approved" }
```

Errors:
- 400 if appointment is in the past or not found for this doctor

---

#### 9) Reject Appointment (Doctor)
`PUT /appointments/:id/reject`

Headers:
```
Authorization: Bearer <doctor_token>
```

Success:
```json
{ "message": "Appointment rejected" }
```

---

## 🔎 Notes & Best Practices
- Always store **hashed** passwords (`bcrypt`) — never plain text.
- Use `express.json()` before routes so `req.body` is available.
- Validate `appointment_date` on both client and server.
- Keep `JWT_SECRET` safe; never commit it to source control.

---
