# Logistics & Courier MVP (MERN)

A production-style Logistics & Courier MVP built to demonstrate real-world
backend and frontend architecture, role-based access control, and complete
job lifecycle management.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT (role-based access control)
- Frontend: React (Vite), Tailwind CSS v3, React Router
- File Uploads: Multer (Proof of Delivery)

## Roles & Capabilities

### Admin
- Create delivery jobs
- Assign drivers
- View all jobs and job details
- View Proof of Delivery (POD)

### Driver
- View assigned jobs only
- Update job status in strict order:
  `ASSIGNED → PICKED_UP → ON_ROUTE → DELIVERED`
- Upload POD photo

### Client
- Create jobs
- View only jobs they created
- View job status and delivery progress

## Key Features
- Strict backend ownership checks
- Role-based route protection (backend + frontend)
- Enforced status transitions
- Reusable delivery status timeline UI
- File upload + static serving for POD images

## Project Structure
logistics-mvp/
backend/
frontend/
uploads/

shell
Copy code

## Running Locally

### MongoDB (Docker)
```bash
docker run -d --name logistics-mongo -p 27017:27017 mongo:7
# or
docker start logistics-mongo
Backend
bash
Copy code
cd backend
npm install
npm run dev
Seed Users
bash
Copy code
npm run seed:admin
npm run seed:driver
npm run seed:client
Frontend
bash
Copy code
cd frontend
npm install
npm run dev
Open:

http://localhost:5173

Environment Variables
ini
Copy code
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/logistics_mvp
JWT_SECRET=super_secret_change_later
JWT_EXPIRES_IN=7d
API Overview
Auth
POST /auth/login

Jobs (Admin / Driver)
GET /jobs

GET /jobs/:id

POST /jobs (admin)

PATCH /jobs/:id/assign-driver (admin)

PATCH /jobs/:id/status (driver)

POST /jobs/:id/pod/photo (driver)

Client
GET /client/jobs

GET /client/jobs/:id

POST /client/jobs
