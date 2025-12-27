# InTrack - Quality Control Management System

A modern web-based quality control system designed for garment manufacturing facilities. InTrack enables production teams to record real-time quality metrics, defects, and production data, while providing administrators with comprehensive analytics and dashboards.

## Overview

InTrack is a full-stack application built with **React** (frontend) and **Node.js/Express** (backend), using **MySQL** for data persistence. The system supports two main roles:

- **QC Manager**: Records production data, defects, modifications, and rejections in real-time
- **Admin**: Monitors production analytics, rework rates, and quality metrics across all production lines

## Key Features

- **Role-Based Access**: No login required; select role on startup
- **Real-Time Recording**: Instant QC data capture for production units
- **Production Tracking**: Monitor FTT (First Time Through), defects, modifications, and rejections
- **Multi-Line Support**: Track data across 5+ production lines simultaneously
- **Analytics Dashboard**: View production trends, defect rates, and rework metrics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Professional UI**: Built with Semantic UI for a polished user experience
- **Production History**: Complete audit trail of all recorded quality events

## Tech Stack

### Frontend

- **React 18** - UI library
- **Semantic UI React** - Component framework
- **Moment.js** - Date/time handling
- **CSS3** - Custom styling with animations

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **CORS** - Cross-origin resource sharing

### Tools & Environment

- **npm** - Package management
- **Homebrew** - Dependency management (macOS)
- **Git** - Version control

## Prerequisites

Before running InTrack, ensure you have installed:

- **Node.js** (v14+): [Download](https://nodejs.org/)
- **MySQL** (v5.7+): `brew install mysql`
- **npm** (comes with Node.js)
- **Git** (optional): `brew install git`

## Quick Start

### 1. Clone the Repository

### 2. Set Up MySQL Database

mysql.server start
mysql -u root -p
CREATE DATABASE intrack_db;
EXIT;

### 3. Configure Backend Environment

Create `backend/.env`:

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=intrack_db
DB_USER=root
DB_PASSWORD=StrongPass123!
NODE_ENV=development
PORT=3001

### 4. Install Dependencies & Start Backend

cd backend
npm install
npm run dev

Backend runs on `http://localhost:3001`

### 5. Install Dependencies & Start Frontend

In a **new terminal**:

cd frontend
npm install
npm start

Frontend runs on `http://localhost:3000`

### 6. Access the Application

Open http://localhost:3000 and select your role

## Project Structure

intrack/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── routes/
│ │ ├── controllers/
│ │ └── app.js
│ ├── .env
│ ├── package.json
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Admin/
│ │ │ ├── QC/
│ │ │ ├── Navigation/
│ │ │ └── RoleSelection/
│ │ ├── styles/
│ │ ├── context/
│ │ ├── App.js
│ │ └── index.js
│ ├── public/
│ └── package.json
│
└── README.md

## Usage

### QC Manager Workflow

1. Log in as QC Manager
2. Select production line from dropdown
3. Record production data using action buttons
4. View history in the table
5. Switch lines as needed

### Admin Workflow

1. Log in as Admin
2. View dashboard with key metrics
3. Analyze rework rates by production line
4. Review daily summaries
5. Adjust date range to view trends

## Database Management

### View Database Tables

mysql -u root -p
USE intrack_db;
SHOW TABLES;
SELECT \* FROM production_records;
EXIT;

### Reset Database

mysql -u root -p -e "DROP DATABASE intrack_db; CREATE DATABASE intrack_db;"

## Troubleshooting

### MySQL Connection Error

Problem: `Can't connect to local MySQL server through socket`

Solution:

mysql.server start
brew services start mysql

text

### Port Already in Use

For port 3001 (backend):

lsof -i :3001
kill -9 <PID>

text

For port 3000 (frontend):

lsof -i :3000
kill -9 <PID>

text

### Dependencies Not Installing

npm cache clean --force
rm -rf node_modules package-lock.json
npm install

text

## Security Notes

- Change default MySQL password in production
- Use environment variables for sensitive data
- Never commit `.env` files to git
- Add `.env` to `.gitignore`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

**Last Updated**: December 27, 2025
