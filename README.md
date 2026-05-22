# KariyerAI - Job Portal Microservices (SE4458 Final Project)

## Project Overview
KariyerAI is a modern, distributed job portal application built using a microservices architecture. It allows job seekers to search, filter, and apply for jobs while allowing employers to post jobs and manage applicants. 

The architecture strictly follows the **SE4458 Final Project** requirements, emphasizing cloud-native solutions, distributed caching, messaging queues, and NoSQL databases.

## 🚀 Architecture & Technologies Used

- **Frontend:** React (Vite) + Lucide Icons
- **Backend (Microservices):** Node.js, Express.js
- **Primary Database (Relational):** Supabase (PostgreSQL) - Used for User Auth, Job Postings, and Alerts.
- **Secondary Database (NoSQL):** MongoDB Atlas - Used for storing User Search Histories.
- **Distributed Cache:** Upstash Redis - Used to cache `/jobs` queries and reduce database load.
- **Message Broker:** CloudAMQP (RabbitMQ) - Handles async job creation events.
- **Authentication:** Supabase IAM (Cloud Auth)
- **Deployment:** Docker & Docker Compose (Ready for AWS EC2)

---

## 🛠️ Microservices Setup

The project is divided into the following isolated services:

1. **Job Posting Service (Port 3001):** Manages CRUD operations for jobs and job alerts. Handles job applications.
2. **Job Search Service (Port 3002):** Proxies search requests and logs user searches to **MongoDB (NoSQL)**.
3. **Notification Service (Port 3003):** 
   - **Cron 1 (08:00):** Checks user's Job Alerts and sends matches.
   - **Cron 2 (09:00):** Reads NoSQL Search History and sends related job recommendations.
   - *Emails are sent using Nodemailer integration.*
4. **API Gateway (Port 3000):** Basic routing gateway for potential monolithic external access.
5. **Frontend (Port 80/5173):** React Single Page Application.

---

## ☁️ Deployment Strategy

Strictly following the project requirements, each service is deployed **independently** to cloud providers. The frontend only communicates with the backend through the **API Gateway**.

### Deployment Steps:
1. **Backend Microservices (Render.com / App Runner):**
   Deploy `job-posting-service`, `job-search-service`, and `notification-service` as independent web services.
2. **API Gateway:**
   Deploy the `api-gateway` service. Configure its Environment Variables (`JOB_POSTING_URL`, `JOB_SEARCH_URL`) to point to the internal URLs of the deployed microservices.
3. **Frontend (Vercel / Netlify):**
   Deploy the React application. Set the `VITE_API_GATEWAY_URL` environment variable to the public URL of the deployed API Gateway.

This ensures a true microservices deployment where services are isolated and routed exclusively through the Gateway.

---

## 📋 Fulfilled PDF Requirements Checklist
- [x] **Microservices Architecture:** Implemented 4 backend services + API Gateway.
- [x] **Cloud Auth (IAM):** Used Supabase Auth instead of local login.
- [x] **Cloud DB (Relational):** Used Supabase PostgreSQL.
- [x] **Cloud DB (NoSQL):** Used MongoDB Atlas for search history.
- [x] **Distributed Caching:** Upstash Redis is active for Job Postings.
- [x] **Message Queue:** RabbitMQ is used for background tasks.
- [x] **Job Alerts (Cron):** Daily scheduled notifications via Node-Cron + Nodemailer.
- [x] **Role-Based Views:** Employers can't apply, Job Seekers can't see the employer admin panel.
- [x] **Dockerization:** Each service has a `Dockerfile` and orchestrated via `docker-compose.yml`.
- [x] **UI/UX Design:** Dark mode, responsive, glassmorphism UI.

## 🔗 Links (To be filled for submission)
- **GitHub Repository:** [Insert Link Here]
- **Live Application URL:** [Insert AWS EC2 IP Here]
- **Video Walkthrough:** [Insert YouTube Link Here]
