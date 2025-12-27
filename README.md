InTrack - Quality Control Management System

A modern web-based quality control system designed for garment manufacturing facilities. InTrack enables production teams to record real-time quality metrics, defects, and production data, while providing administrators with comprehensive analytics and dashboards.

Overview
InTrack is a full-stack application built with React (frontend) and Node.js/Express (backend), using MySQL for data persistence. The system supports two main roles:

QC Manager: Records production data, defects, modifications, and rejections in real-time

Admin: Monitors production analytics, rework rates, and quality metrics across all production lines

Key Features

Role-Based Access: No login required; select role on startup

Real-Time Recording: Instant QC data capture for production units

Production Tracking: Monitor FTT (First Time Through), defects, modifications, and rejections

Multi-Line Support: Track data across 5+ production lines simultaneously

Analytics Dashboard: View production trends, defect rates, and rework metrics

Responsive Design: Works seamlessly on desktop, tablet, and mobile devices

Professional UI: Built with Semantic UI for a polished user experience

Production History: Complete audit trail of all recorded quality events

Tech Stack
Frontend
React 18 - UI library

Semantic UI React - Component framework

Moment.js - Date/time handling

CSS3 - Custom styling with animations

Backend
Node.js - JavaScript runtime

Express.js - Web framework

MySQL - Relational database

CORS - Cross-origin resource sharing

Tools & Environment
npm - Package management

Homebrew - Dependency management (macOS)

Git - Version control

Prerequisites

Before running InTrack, ensure you have installed:

Node.js (v14+): Download

MySQL (v5.7+): brew install mysql

npm (comes with Node.js)

Git (optional): brew install git

Quick Start

1. Clone the Repository
   bash
   git clone https://github.com/yourusername/intrack.git
   cd intrack
2. Set Up MySQL Database
   bash

# Start MySQL

mysql.server start

# Create database and user

mysql -u root -p
CREATE DATABASE intrack_db;
CREATE USER 'intrack_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON intrack_db.\* TO 'intrack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT; 3. Configure Backend Environment
Create backend/.env:

text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=intrack_db
DB_USER=root
DB_PASSWORD=StrongPass123!
NODE_ENV=development
PORT=3001 4. Install Dependencies & Start Backend
bash
cd backend
npm install
npm run dev
Backend runs on http://localhost:3001

5. Install Dependencies & Start Frontend
   In a new terminal:

bash
cd frontend
npm install
npm start
Frontend runs on http://localhost:3000

6. Access the Application
   Open http://localhost:3000 in your browser and select your role:

Admin → Dashboard with analytics

QC Manager → Quality control recording interface

Project Structure

text
intrack/
├── backend/
│ ├── src/
│ │ ├── config/ # Database configuration
│ │ ├── routes/ # API endpoints
│ │ ├── controllers/ # Business logic
│ │ └── app.js # Express setup
│ ├── .env # Environment variables
│ ├── package.json
│ └── server.js # Server entry point
│
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ │ ├── Admin/ # Admin dashboard
│ │ │ ├── QC/ # QC panel
│ │ │ ├── Navigation/ # Nav bar
│ │ │ └── RoleSelection/ # Role selector
│ │ ├── styles/ # CSS files
│ │ ├── context/ # Context API
│ │ ├── App.js
│ │ └── index.js
│ ├── public/
│ ├── package.json
│ └── .env (optional)
│
└── README.md
Usage

QC Manager Workflow
Log in as QC Manager

Select production line from dropdown

Record production data using action buttons:

First Time Through - Product passed without issues

Record Defect - Select defect category and record

Record Modified - Product needed modification

Record Rejection - Product failed quality check

View history - See all recorded entries in the table

Switch lines - Change production line to record for different areas

Admin Workflow
Log in as Admin

View dashboard with key metrics:

Total products produced

Average defect rate

Active production lines

Analyze rework rates by production line

Review daily summaries with detailed defect breakdowns

Adjust date range (7, 30, or 90 days) to view trends

Database Schema

Key Tables
production_records

sql
id, production_line_id, record_type, defect_category,
rejection_reason, timestamp, user_id, notes
production_lines

sql
id, name, location, status, created_at
defect_categories

sql
id, name, description, severity
rejection_reasons

sql
id, reason, category, actionable
Available Scripts

Backend
bash
npm run dev # Start development server with auto-reload
npm run start # Start production server
npm test # Run tests (if configured)
Frontend
bash
npm start # Start development server
npm run build # Create optimized production build
npm test # Run tests
npm run eject # Expose webpack configuration (one-way)
Database Management

View Database Tables
bash
mysql -u root -p
USE intrack_db;
SHOW TABLES;
SELECT \* FROM production_records;
EXIT;
Reset Database
bash
mysql -u root -p -e "DROP DATABASE intrack_db; CREATE DATABASE intrack_db;"
mysql -u root -p intrack_db < backend/schema.sql
Troubleshooting

MySQL Connection Error
Problem: Can't connect to local MySQL server through socket

Solution:

bash
mysql.server start
brew services start mysql
Port Already in Use
For port 3001 (backend):

bash
lsof -i :3001
kill -9 <PID>
For port 3000 (frontend):

bash
lsof -i :3000
kill -9 <PID>
Dependencies Not Installing
bash

# Clear npm cache

npm cache clean --force

# Reinstall

rm -rf node_modules package-lock.json
npm install
