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

```bash
git clone https://github.com/yourusername/intrack.git
cd intrack
```

### 2. Set Up MySQL Database

```bach
# Start MySQL
mysql.server start

# Create database and user
mysql -u root -p
CREATE DATABASE intrack_db;
CREATE USER 'intrack_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON intrack_db.* TO 'intrack_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Backend Environment

Create `backend/.env`:

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=intrack_db
DB_USER=root
DB_PASSWORD=StrongPass123!
NODE_ENV=development
PORT=3001
```

### 4. Install Dependencies & Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### 5. Install Dependencies & Start Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### 6. Access the Application

Open http://localhost:3000 and select your role

## Project Structure

```
intrack/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── routes/
│ │ ├── logs/
│ │ ├── controllers/
│ │ ├── routes
│ │ └── utils
│ ├── .env
│ ├── index.js
│ ├── package.json
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Admin/
│ │ │ ├── Auth/
│ │ │ ├── Common/
│ │ │ └── QC/
│ │ ├── styles/
│ │ ├── context/
│ │ ├── assets
│ │ ├── utils
│ │ ├── App.js
│ │ └── index.js
│ ├── public/
│ └── package.json
│
└── README.md
```

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

## License

This project is licensed under the MIT License.

**Last Updated**: December 27, 2025
