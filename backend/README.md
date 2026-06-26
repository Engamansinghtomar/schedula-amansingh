# Schedula - Doctor Appointment System Backend

## Overview

Schedula is a backend system for managing doctor appointments. It provides secure authentication, doctor and patient onboarding, doctor discovery, availability management, slot generation, appointment booking, advanced scheduling, and appointment rescheduling.

Built using NestJS, PostgreSQL, TypeORM, and JWT Authentication.

---

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* JWT Authentication
* Passport.js
* Bcrypt
* Render (Deployment)
* Neon PostgreSQL

---

## Live Server

https://schedula-amansingh.onrender.com

---

## Features Implemented

### Day 1 - Project Setup

* NestJS project initialization
* PostgreSQL database configuration
* TypeORM integration
* Environment configuration

### Day 2 - Role Based Authentication

* User registration
* User login
* JWT authentication
* Password hashing using bcrypt
* Role-based access control (Doctor / Patient)

### Day 3 - Doctor & Patient Onboarding

* Doctor profile creation
* Patient profile creation
* Profile management APIs

### Day 4 - Doctor Discovery

* Search doctors
* Filter doctors by specialization
* Doctor listing APIs

### Day 5 - Deployment

* Backend deployment on Render
* PostgreSQL integration with Neon Database

### Day 6 - Doctor Availability

* Recurring availability
* Custom availability overrides

### Day 7 - Slot Generation

* Dynamic slot generation
* Patient slot viewing APIs

### Day 8 - Appointment Booking

* Book appointment
* View appointments
* Appointment management

### Day 9 - Advanced Scheduling

* STREAM scheduling
* WAVE scheduling
* Token-based appointment flow

### Day 10 - Appointment Rescheduling

* Reschedule appointments
* Slot validation
* Suggested alternative slots
* Conflict handling

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

### Run Application

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

| Variable    | Description       |
| ----------- | ----------------- |
| DB_HOST     | PostgreSQL Host   |
| DB_PORT     | PostgreSQL Port   |
| DB_USERNAME | Database Username |
| DB_PASSWORD | Database Password |
| DB_NAME     | Database Name     |
| JWT_SECRET  | JWT Secret Key    |

---

## API Collection

Postman Collection: To be attached in repository / submission.

---

## Repository

https://github.com/Engamansinghtomar/schedula-amansingh

---

## Author

Aman Singh Tomar

Backend Internship Project - Schedula Doctor Appointment System
