# 🎟️ Event Management System - Full-Stack Application  
A complete platform for managing events, organizing tickets, and enabling attendees to browse, book, and review events.

This project is built using:

- **Backend:** Node.js, Express, TypeORM, PostgreSQL  
- **Frontend:** React (Vite + TypeScript)  
- **Auth:** JWT-based authentication  
- **Database:** PostgreSQL (auto-generated tables via TypeORM)  

---

##  Features

### 👤 User Roles
- **Admin** — approves organizer registrations, manages reported events  
- **Organizer** — creates and manages their own events & ticket types  
- **Attendee** — browses events, books tickets, leaves reviews  
- **Viewer** — can browse events without logging in  

---

## 📦 Backend Setup

### **1. Navigate to backend**
```bash
cd backend
npm install
```

Create .env.staging file inside `backend/environments/`

POSTGRES_HOSTNAME=localhost  
POSTGRES_PORT=5432  
POSTGRES_USERNAME=postgres  
POSTGRES_PASSWORD=your_password  
POSTGRES_DATABASE=event_management  
JWT_SECRET=your_jwt_secret  
PORT=8080

```bash
npm run dev
```

## 📦 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📦 Database
- PostgreSQL is used as the primary relational DB

- All tables (users, events, tickets, bookings, reviews, reports) are auto-created using TypeORM

- Cascading deletes ensure integrity for events → tickets → bookings