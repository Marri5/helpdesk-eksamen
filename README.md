# HelpDesk System

A complete helpdesk system inspired by Spiceworks, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User Authentication (Login/Register)
- Role-based Access Control (User/Admin)
- Ticket Creation and Management
- Status Tracking
- Priority Setting
- Category Assignment
- Comment System
- Admin Dashboard with Statistics
- Responsive UI

## Tech Stack

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- RESTful API architecture
- MVC pattern

### Frontend
- React with hooks and context API
- React Router for routing
- Axios for API requests
- TailwindCSS for UI styling

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://10.12.3.88:27017/helpdesk
   JWT_SECRET=helpdeskapp_secret_key
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React app:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get a single ticket
- `POST /api/tickets` - Create a new ticket
- `PUT /api/tickets/:id` - Update a ticket
- `DELETE /api/tickets/:id` - Delete a ticket
- `POST /api/tickets/:id/comments` - Add a comment to a ticket
- `GET /api/tickets/stats` - Get ticket statistics (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a user by ID (admin only)
- `PUT /api/users/:id` - Update a user (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

## License

This project is licensed under the MIT License.