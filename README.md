Employee Leave Management System (ELMS)

A full-stack web application to manage employee leave requests with real-time approval/rejection, geolocation tracking, and analytics.

Project Overview

    ELMS is designed to streamline leave management for organizations:

    Employees can apply for leaves while their location and IP are automatically logged.

    Administrators and HR can approve/reject requests, monitor leave trends, and generate audit-ready reports.

    Focused on efficiency, transparency, and actionable insights.

Key Highlights

    Location Logging

    Automatically captures latitude, longitude, and IP for each leave application.

    Helps verify application authenticity and monitor remote work locations.

    Email Notifications

    Sends automatic emails for leave approval or rejection.

    Keeps employees and managers informed in real-time.

    Export

    Leave history can be exported to PDF or Excel for auditing and record-keeping.

    Analytics & Visualization

    Interactive charts show leave trends, statistics, and team leave utilization.

    Helps HR and management make data-driven decisions.

Technology Stack
Layer	Technology / Tool
    Frontend	React 19, Tailwind CSS, Axios, Recharts, React Toastify
    Backend	Node.js, Express.js, MongoDB
    Deployment	Docker, Render, Jenkins (CI/CD)
    Maps & Geo	Google Maps API
    Features

Employee

    Apply for leave (with reason and type)

    Auto log location (latitude, longitude, IP)

    View applied leave status

    View leave history in calendar

    Export leave data (PDF/Excel)

Admin

    Approve/reject leave requests

    Monitor leave locations on Google Maps

    Export leave data for auditing

    View analytics of leave trends

HR

    Approve/reject leave requests

    Export leave data for auditing

    View analytics of leave trends

    Search/filter leave requests by employee, type, status, or date

Project Structure
    /backend       --> Node.js + Express backend, MongoDB models & APIs
    /frontend      --> React frontend with Tailwind CSS
    .gitignore
    render.yaml    --> Render deployment configuration

Setup Instructions

    Backend

        cd backend
        npm install
        cp .env.example .env  # configure MongoDB URI and Google Maps API key
        nodemon server.js


    Frontend    

        cd frontend
        npm install
        npm run dev


Access: Open http://localhost:5173
 in your browser (default Vite port).

License

This project is licensed under the MIT License – see the LICENSE file for details.
