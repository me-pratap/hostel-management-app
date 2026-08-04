# Hostel Tenant Management System - Project Plan & Specification

## 📌 Project Overview
This project is a comprehensive Hostel and Tenant Management System designed to manage rooms, tenant profiles, monthly rent payments, and automated reminders.

## 🏗️ Architecture & Tech Stack
- **Backend Framework**: Python with FastAPI (Asynchronous API design)
- **Database**: MongoDB (using Motor for async operations, hosted on MongoDB Atlas)
- **Task Scheduling**: APScheduler (for automated cron jobs like monthly rent generation and reminders)
- **Authentication**: JWT based authentication (assumed from `auth_router`)
- **Frontend**: Likely a React (Vite/CRA) or Next.js app (running on `localhost:5173` / `3000`)

## 🗄️ Database Models & Entities

### 1. Rooms
- Tracks room numbers (e.g., "1", "2", or "Office").
- Categorized by Floor (Ground, First) and Type (Rent, Office).
- Tracks capacity (default: 3) and current `occupant_ids`.

### 2. Tenants
- Comprehensive profile storage: Full Name, DOB, Gender, Blood Group.
- Documentation: Aadhar Number, Aadhar Photo, Profile Photo.
- Contact Details: Personal, Alternate, Emergency Contact, Parents, Local Guardian.
- Rent Details: Room assigned, Bed slot, Monthly Rent Amount, specific `rent_due_day` for each tenant.
- Verification: Tracks Police Verification Status (Pending, Done, Not Required).

### 3. Rent Payments
- Generated automatically on the 1st of every month at midnight via a cron job.
- Tracks `month_year`, `due_date`, `amount_due`, `amount_paid`, and payment status (Paid, Partial, Unpaid).
- Keeps a log of reminders sent (`reminders_sent`).

## ⚙️ Core Automated Services

### Monthly Payment Generation (`monthly_payment_gen`)
- **Schedule**: 1st of every month at 00:05 AM.
- **Action**: Iterates over all active tenants and creates a new `RentPayment` document for the current month, setting the correct due date based on the tenant's individual `rent_due_day`.

### Daily Reminders (`daily_reminders`)
- **Schedule**: Every day at 9:00 AM.
- **Action**: Checks for unpaid or partially paid rent and triggers reminders. 
- **Types of Reminders**:
  - `due_date`: Sent on the exact due date.
  - `day_1`: Sent 1 day after the due date.
  - `day_5`: Sent 5 days after the due date.

## 📂 Project Structure (Backend)
```
/backend
│── main.py            # FastAPI app entry point, middleware, router registration, scheduler startup
│── database.py        # MongoDB connection setup and teardown
│── config.py          # Environment variables and configurations (MongoDB URI, Secrets, WhatsApp Tokens)
│── models.py          # Pydantic schemas and enums
│── auth.py            # Authentication logic
│── seed.py            # Database seeding script (for initial setup)
│── requirements.txt   # Python dependencies
│── /routers           # API Endpoints (auth, rooms, tenants, payments, reminders)
│── /services          # Business logic and scheduled tasks (payment_service, reminder_service)
└── /uploads           # Static folder for uploaded files (photos, Aadhar cards)
```

## 🚀 Environment Setup & Deployment
- Relies on `.env` file containing variables like `MONGODB_URI`, `DB_NAME`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
- WhatsApp integration tokens (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`) are available in config, suggesting future/current automated WhatsApp reminders.
- **Important Note**: When connecting to MongoDB Atlas, ensure the host machine's IP is whitelisted and `certifi` is passed to the Motor client to avoid SSL Handshake errors.
