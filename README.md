# Helpdesk System

A comprehensive helpdesk system with ticket management, user administration, and responsive UI.

## Features

- User authentication and role-based access control
- Ticket creation and management
- Comments on tickets for user-admin communication
- Ticket history tracking
- Status and priority management
- Statistics for administrators
- Responsive design that works on mobile and desktop

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current logged in user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tickets
- `GET /api/tickets` - Get all tickets (admin sees all, users see their own)
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/comments` - Add comment to ticket
- `GET /api/tickets/stats` - Get ticket statistics (admin only)

## Setup Instructions

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://10.12.3.88:27017/helpdesk
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   BACKEND_URL=http://10.12.3.77:5000
   ```

4. Seed the database with initial data:
   ```
   npm run seed
   ```

5. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the client:
   ```
   npm start
   ```

## Default Users

After running the seeder, you can use these credentials:

- Admin User:
  - Email: admin@example.com
  - Password: password123

- Regular User:
  - Email: user@example.com
  - Password: password123