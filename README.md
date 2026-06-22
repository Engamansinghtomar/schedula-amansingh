# Schedula - Doctor Appointment System Backend

## Overview

Schedula is a backend system for managing doctor appointments. It provides secure authentication, doctor and patient onboarding, doctor discovery, doctor availability management, slot generation, appointment booking, advanced scheduling, and appointment rescheduling.

The project is built using NestJS, PostgreSQL, TypeORM, and JWT Authentication.

---

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT Authentication
* Passport.js
* Bcrypt
* Render
* Neon PostgreSQL

---

## Live Server

https://schedula-amansingh.onrender.com

---

## Features Implemented

### Day 1 - Project Setup

* NestJS project setup
* PostgreSQL configuration
* TypeORM integration
* Environment configuration

### Day 2 - Role Based Authentication

* User Signup
* User Login
* JWT Authentication
* Password Hashing
* Role Based Authorization (Doctor / Patient)

### Day 3 - Doctor & Patient Onboarding

* Create Doctor Profile
* Update Doctor Profile
* Create Patient Profile
* Update Patient Profile

### Day 4 - Doctor Discovery

* Get All Doctors
* Get Doctor Details
* Search & Discovery APIs

### Day 5 - Deployment

* Backend Deployment on Render
* Neon PostgreSQL Integration

### Day 6 - Doctor Availability

* Create Recurring Availability
* Update Availability
* Delete Availability
* Custom Availability Override

### Day 7 - Slot Generation

* Dynamic Slot Generation
* Doctor Slot Viewing

### Day 8 - Appointment Booking

* Book Appointment
* View Patient Appointments
* View Doctor Appointments
* Cancel Appointment

### Day 9 - Advanced Scheduling

* STREAM Scheduling
* WAVE Scheduling
* Token Based Scheduling

### Day 10 - Appointment Rescheduling

* Appointment Rescheduling
* Slot Validation
* Alternative Slot Suggestions

---

## Project Setup

### Clone Repository

```bash
git clone https://github.com/Engamansinghtomar/schedula-amansingh.git
cd backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=schedula_db

JWT_SECRET=schedula_secret_key
```

### Run Project

Development:

```bash
npm run start:dev
```

Production:

```bash
npm run build
npm run start:prod
```

---

## Environment Variables

| Variable    | Description         |
| ----------- | ------------------- |
| DB_HOST     | PostgreSQL Host     |
| DB_PORT     | PostgreSQL Port     |
| DB_USERNAME | PostgreSQL Username |
| DB_PASSWORD | PostgreSQL Password |
| DB_NAME     | Database Name       |
| JWT_SECRET  | JWT Secret Key      |

---

## API Collection

Postman Collection:

```text
postman/Schedula-Backend-API-Collection.json
```

The collection contains all implemented APIs including:

* Authentication APIs
* Doctor APIs
* Patient APIs
* Availability APIs
* Slot Generation APIs
* Appointment APIs
* Rescheduling APIs

---

## Health Check

```http
GET /
```

Response:

```json
{
  "status": "success",
  "service": "Schedula Backend API",
  "version": "1.0.0",
  "message": "Server is running successfully"
}
```

---

## Repository

https://github.com/Engamansinghtomar/schedula-amansingh

---

## Author

Aman Singh Tomar

Backend Internship Project – Schedula Doctor Appointment System
