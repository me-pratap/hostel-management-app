# Hostel Management Application

A modern, full-stack web application designed to streamline hostel operations, tenant management, and rent collection. Built with a focus on speed, beautiful UI, and automated reminders.

---

## 🚀 Tech Stack & Infrastructure

This application is built using a modern decoupled architecture, ensuring scalability and ease of deployment.

### Frontend (Client)
- **Framework:** React + TypeScript (built with Vite)
- **Styling:** CSS Variables + Glassmorphism design system
- **State Management:** `@tanstack/react-query` for API caching and optimistic UI updates
- **Routing:** `react-router-dom`
- **Hosting:** **Vercel** (Provides global CDN, instant deployments, and SSL)

### Backend (API)
- **Framework:** FastAPI (Python) - High performance asynchronous API
- **Driver:** Motor (Asynchronous MongoDB driver)
- **Background Tasks:** APScheduler (For automated rent generation)
- **Hosting:** **Render** (Fully managed Web Service with automated builds)

### Database & Storage
- **Database:** MongoDB Atlas (Cloud-hosted NoSQL document database)
- **Media Storage:** **Cloudinary** (Securely stores tenant profile pictures and Aadhar card images in the cloud)

---

## 🛠️ What We Have Built So Far

- **Interactive Dashboard:** Live metrics for total rooms, active tenants, and occupancy rates.
- **Room Management:** Floor plans, capacity tracking, and automatic assignment logic.
- **Tenant Profiles:** Comprehensive tenant records including emergency contacts, Aadhar uploads, and police verification status.
- **Automated Ledger:** The backend automatically generates monthly rent invoices for all active tenants via a scheduled cron job.
- **Payment Tracking:** Log partial or full payments, view due dates, and track exact payment dates.
- **WhatsApp Integration:** 1-click intelligent WhatsApp redirection to send tailored rent reminders or automated "Thank You" payment receipts with dynamic amounts.
- **Database Optimization:** Strict composite indexing implemented to guarantee no duplicate invoices and lightning-fast queries at scale.
- **State Caching:** Implemented React Query to cache data in the browser, eliminating unnecessary loading spinners and reducing backend load.

---

## 🗺️ Future Roadmap & Remaining Upgrades

To transition this application from a functional MVP to an enterprise-grade production system, the following upgrades are planned:

### 1. Authentication & Security (Priority: High)
- **Current State:** Hardcoded admin login.
- **Future:** Implement robust JWT (JSON Web Tokens) authentication or integrate Firebase Auth. This will allow for Role-Based Access Control (e.g., Owner vs. Manager roles).

### 2. Data Validation & Integrity (Priority: Medium)
- **Current State:** Basic type checking via Pydantic.
- **Future:** Add strict Regex validators to the backend models to enforce standard lengths for Indian phone numbers, specific Aadhar formats, and bounds on currency inputs to prevent dirty data.

### 3. Error Tracking & Monitoring (Priority: Medium)
- **Current State:** Console logs and basic API exception handling.
- **Future:** Integrate **Sentry** (or Datadog) across both the frontend and backend. This will provide real-time alerts and stack traces if the app crashes in production or fails to connect to the database.

### 4. Multi-Tenancy Architecture (Priority: Low / Long-Term)
- **Current State:** The database schema assumes a single hostel property.
- **Future:** Introduce a `hostel_id` parameter to all database collections. This will allow the owner to seamlessly manage multiple different hostel buildings from a single admin dashboard without needing to deploy separate apps.

### 5. AI Form Extraction (Future Feature)
- Integrate an OCR/AI vision model so that uploading an Aadhar card automatically fills in the tenant's Name, DOB, Address, and Aadhar Number in the form.
