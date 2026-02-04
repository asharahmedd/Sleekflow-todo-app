# 🚀 SleekFlow Todo Application

A modern, full-stack todo list application with real-time collaboration, built with Vue.js, Node.js, Express, MongoDB, and Socket.io.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Vue](https://img.shields.io/badge/vue-3.x-brightgreen.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based registration and login
- ✅ **Todo CRUD Operations** - Create, read, update, and delete todos
- ✅ **Real-time Collaboration** - Live activity feed with Socket.io
- ✅ **Todo Sharing** - Share todos with other users
- ✅ **Comments System** - Add comments to todos
- ✅ **Priority Levels** - Low, Medium, High priorities with color coding
- ✅ **Status Tracking** - Not Started, In Progress, Completed

### Advanced Features
- 🔍 **Search Functionality** - Search todos by name
- 🎯 **Filtering** - Filter by status and priority
- 📊 **Sorting** - Sort by date, name, priority
- 🌓 **Dark/Light Mode** - Beautiful theme toggle
- 📧 **Email Notifications** - Notifications for shares and comments
- ⚙️ **User Preferences** - Customizable notification settings
- 🔔 **Toast Notifications** - Real-time activity updates
- 🎨 **Modern UI/UX** - Professional, minimalistic design with `#0066FF` primary color

### Developer Features
- 🧪 **Test-Driven Development** - 139 tests (112 unit, 27 integration)
- 📝 **DTOs** - Proper request validation and response formatting
- 🔒 **Security** - Password hashing, JWT tokens, access control
- 🎯 **TypeScript** - Fully typed frontend and backend

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Language:** TypeScript
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Build Tool:** Vite
- **Styling:** CSS with CSS Variables

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Real-time:** Socket.io
- **Email:** Nodemailer
- **Task Scheduling:** node-cron

### Testing
- **Framework:** Jest
- **HTTP Testing:** Supertest
- **In-Memory DB:** mongodb-memory-server
- **Coverage:** 139 tests across unit and integration

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **MongoDB** >= 6.0 ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/asharahmedd/Sleekflow-todo-app
cd "Sleek Flow Coding Task"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env  # or create manually
```

Add the following variables to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sleekflow-todo
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sleekflow-todo

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Email Configuration (Optional)
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@sleekflow.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```bash
cd ../frontend
touch .env  # or create manually
```

Add the following variables to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Important Notes:

1. **JWT_SECRET**: Use a strong, random string in production
2. **MONGODB_URI**: Update with your MongoDB connection string
3. **EMAIL_ENABLED**: Set to `true` only if you want email notifications
4. **EMAIL_PASS**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)

---

## ▶️ Running the Application

### Development Mode

#### 1. Start MongoDB (if running locally)

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

#### 2. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Production Mode

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

---

## 🧪 Testing

### Backend Tests

The backend includes comprehensive unit and integration tests.

#### Run All Tests

```bash
cd backend
npm test
```

#### Run Tests in Watch Mode

```bash
npm run test:watch
```

#### Run Tests with Coverage

```bash
npm run test:coverage
```

#### Run Tests with Verbose Output

```bash
npm run test:verbose
```

### Test Coverage

- **Unit Tests:** 112 tests
  - Controllers: Auth, Todo (65 tests)
  - Middleware: Authentication (8 tests)
  - Models: User, Todo (39 tests)

- **Integration Tests:** 27 tests
  - Auth endpoints (12 tests)
  - Todo CRUD (11 tests)
  - Sharing workflow (9 tests)
  - Comments (10 tests - partial)

- **Total:** 139 tests

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-04T12:00:00.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-04T12:00:00.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-04T12:00:00.000Z"
}
```

#### Search Users
```http
GET /api/auth/users/search?q=john
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

### Todo Endpoints

#### Get All Todos
```http
GET /api/todos
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "name": "Complete Project",
    "description": "Finish the SleekFlow todo app",
    "status": "In Progress",
    "priority": "High",
    "dueDate": "2026-02-10T00:00:00.000Z",
    "createdBy": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "sharedWith": [],
    "createdAt": "2026-02-04T12:00:00.000Z",
    "updatedAt": "2026-02-04T12:00:00.000Z"
  }
]
```

#### Create Todo
```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Complete Project",
  "description": "Finish the SleekFlow todo app",
  "dueDate": "2026-02-10",
  "priority": "High"
}

Response: 201 Created
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Complete Project",
  "description": "Finish the SleekFlow todo app",
  "status": "Not Started",
  "priority": "High",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "createdBy": "65f1a2b3c4d5e6f7g8h9i0j1",
  "sharedWith": [],
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T12:00:00.000Z"
}
```

#### Get Todo by ID
```http
GET /api/todos/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Complete Project",
  ...
}
```

#### Update Todo
```http
PUT /api/todos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completed",
  "priority": "Medium"
}

Response: 200 OK
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "name": "Complete Project",
  "status": "Completed",
  "priority": "Medium",
  ...
}
```

#### Delete Todo
```http
DELETE /api/todos/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Todo deleted successfully"
}
```

#### Share Todo
```http
POST /api/todos/:id/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "userEmail": "jane@example.com"
}

Response: 200 OK
{
  "id": "65f2b3c4d5e6f7g8h9i0j1k2",
  "sharedWith": [
    {
      "id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  ...
}
```

#### Unshare Todo
```http
DELETE /api/todos/:todoId/share/:userId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Todo unshared successfully"
}
```

#### Get Shared Users
```http
GET /api/todos/:id/shared-users
Authorization: Bearer <token>

Response: 200 OK
{
  "creator": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "sharedWith": [
    {
      "id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

### Comment Endpoints

#### Get Comments
```http
GET /api/todos/:todoId/comments
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "65f4d5e6f7g8h9i0j1k2l3m4",
    "todoId": "65f2b3c4d5e6f7g8h9i0j1k2",
    "userId": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "userName": "John Doe",
    "content": "This is a comment",
    "createdAt": "2026-02-04T12:00:00.000Z",
    "updatedAt": "2026-02-04T12:00:00.000Z"
  }
]
```

#### Create Comment
```http
POST /api/todos/:todoId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a comment"
}

Response: 201 Created
{
  "id": "65f4d5e6f7g8h9i0j1k2l3m4",
  "todoId": "65f2b3c4d5e6f7g8h9i0j1k2",
  "userId": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "userName": "John Doe",
  "content": "This is a comment",
  "createdAt": "2026-02-04T12:00:00.000Z",
  "updatedAt": "2026-02-04T12:00:00.000Z"
}
```

#### Get Comment Count
```http
GET /api/todos/:todoId/comments/count
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 5
}
```

### Notification Endpoints

#### Get Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer <token>

Response: 200 OK
{
  "emailOnTodoShared": true,
  "emailOnComment": true
}
```

#### Update Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailOnTodoShared": false,
  "emailOnComment": true
}

Response: 200 OK
{
  "emailOnTodoShared": false,
  "emailOnComment": true
}
```

### Socket.io Events

#### Connect to Socket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### Listen for Activities
```javascript
socket.on('new-activity', (activity) => {
  console.log('New activity:', activity);
  // activity structure:
  // {
  //   type: 'todo_created',
  //   userId: '65f1a2b3c4d5e6f7g8h9i0j1',
  //   userName: 'John Doe',
  //   message: 'John Doe created a new todo: Complete Project',
  //   metadata: { todoId: '...' },
  //   createdAt: '2026-02-04T12:00:00.000Z'
  // }
});
```

---

## 📂 Project Structure

```
Sleek Flow Coding Task/
│
├── backend/                          # Node.js Backend
│   ├── src/
│   │   ├── models/                   # Mongoose Models
│   │   │   ├── User.ts              # User schema
│   │   │   ├── Todo.ts              # Todo schema
│   │   │   ├── Comment.ts           # Comment schema
│   │   │   ├── Activity.ts          # Activity schema
│   │   │   └── NotificationPreferences.ts
│   │   │
│   │   ├── controllers/              # Business Logic
│   │   │   ├── authController.ts    # Auth operations
│   │   │   ├── todoController.ts    # Todo CRUD
│   │   │   ├── commentController.ts # Comments
│   │   │   └── notificationController.ts
│   │   │
│   │   ├── routes/                   # API Routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── todoRoutes.ts
│   │   │   ├── commentRoutes.ts
│   │   │   └── notificationRoutes.ts
│   │   │
│   │   ├── middleware/               # Middleware
│   │   │   ├── auth.ts              # JWT verification
│   │   │   └── errorHandler.ts      # Error handling
│   │   │
│   │   ├── services/                 # External Services
│   │   │   ├── socketService.ts     # Socket.io
│   │   │   └── emailService.ts      # Email sending
│   │   │
│   │   ├── dtos/                     # Data Transfer Objects
│   │   │   ├── request/             # Input validation
│   │   │   │   ├── RegisterUserDTO.ts
│   │   │   │   ├── LoginUserDTO.ts
│   │   │   │   ├── createTodoDTO.ts
│   │   │   │   ├── updateTodoDTO.ts
│   │   │   │   └── CreateCommentDTO.ts
│   │   │   │
│   │   │   └── response/            # Output formatting
│   │   │       ├── UserResponseDTO.ts
│   │   │       ├── TodoResponseDTO.ts
│   │   │       ├── CommentResponseDTO.ts
│   │   │       └── ErrorResponseDTO.ts
│   │   │
│   │   ├── __tests__/               # Test Suites
│   │   │   ├── setup.ts            # Test configuration
│   │   │   ├── unit/               # Unit tests
│   │   │   │   ├── controllers/
│   │   │   │   ├── middleware/
│   │   │   │   └── models/
│   │   │   │
│   │   │   └── integration/        # Integration tests
│   │   │       ├── auth.integration.test.ts
│   │   │       ├── todos.integration.test.ts
│   │   │       ├── sharing.integration.test.ts
│   │   │       └── comments.integration.test.ts
│   │   │
│   │   └── server.ts                # Entry point
│   │
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/                         # Vue.js Frontend
│   ├── src/
│   │   ├── views/                   # Page Components
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── TodoView.vue        # Main app
│   │   │   └── SettingsView.vue
│   │   │
│   │   ├── components/              # Reusable Components
│   │   │   ├── TodoForm.vue        # Create/Edit modal
│   │   │   ├── TodoItem.vue        # Todo display
│   │   │   ├── ShareTodoModal.vue  # Share dialog
│   │   │   └── ActivityFeed.vue    # Real-time feed
│   │   │
│   │   ├── router/                  # Vue Router
│   │   │   └── index.ts
│   │   │
│   │   ├── stores/                  # Pinia Stores
│   │   │   └── authStore.ts
│   │   │
│   │   ├── services/                # API Services
│   │   │   ├── authApi.ts
│   │   │   ├── todoApi.ts
│   │   │   ├── commentApi.ts
│   │   │   └── notificationApi.ts
│   │   │
│   │   ├── assets/                  # Static Assets
│   │   │   └── main.css            # Global styles
│   │   │
│   │   └── main.ts                 # Entry point
│   │
│   ├── .env                        # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md                        # This file
```

---

## 📖 Usage Guide

### 1. User Registration

1. Navigate to `http://localhost:5173`
2. Click **"Sign Up"**
3. Fill in your name, email, and password
4. Click **"Register"**
5. You'll be automatically logged in and redirected to the todo list

### 2. Creating a Todo

1. Click the **"+ Add Todo"** button
2. Fill in the form:
   - **Name:** Short title for your todo
   - **Description:** Detailed description
   - **Due Date:** Select a date
   - **Priority:** Choose Low, Medium, or High
3. Click **"Create"** or **"Save"**
4. Your todo appears in the list instantly

### 3. Managing Todos

#### Update Status
- Click the status dropdown on a todo
- Select: Not Started, In Progress, or Completed

#### Update Priority
- Click the priority dropdown on a todo
- Select: Low, Medium, or High

#### Edit Todo
- Click the **"Edit"** button
- Modify any fields
- Click **"Save"**

#### Delete Todo
- Click the **"Delete"** button
- Confirm deletion

### 4. Sharing Todos

1. Click the **"Share"** button on a todo
2. Enter the email of the user you want to share with
3. Click **"Search"**
4. Click **"Share"** next to their name
5. They'll receive an email notification (if enabled)
6. The todo appears in their list immediately

### 5. Adding Comments

1. Click on a todo to view details
2. Scroll to the comments section
3. Type your comment
4. Click **"Add Comment"**
5. All collaborators receive email notifications (if enabled)

### 6. Real-time Activity Feed

- The activity feed is always visible on the right side
- Shows all actions: creates, updates, shares, comments
- New activities show as toast notifications
- Click the minimize button to collapse

### 7. Search and Filter

#### Search
- Type in the search box at the top
- Todos are filtered in real-time

#### Filter by Status
- Click the status dropdown
- Select a status to filter

#### Filter by Priority
- Click the priority dropdown
- Select a priority to filter

#### Sort
- Click the sort dropdown
- Sort by date, name, or priority

### 8. Dark Mode

- Click the theme toggle button (🌙/☀️) in the top right
- The entire app switches themes instantly
- Your preference is saved for future visits

### 9. Notification Settings

1. Click the **"Settings"** button (⚙️)
2. Toggle email notifications:
   - Email on todo shared
   - Email on comment added
3. Changes save automatically
4. Click **"Back"** to return to todos

---

## 🔧 Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- If using Atlas, verify connection string and whitelist your IP

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change `PORT` in `backend/.env`
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

#### JWT_SECRET Missing
```
Error: JWT_SECRET is not defined
```
**Solution:**
- Add `JWT_SECRET` to `backend/.env`

### Frontend Issues

#### API Connection Error
```
Error: Network Error
```
**Solution:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Check browser console for CORS errors

#### Socket.io Connection Failed
```
WebSocket connection to 'ws://localhost:5000' failed
```
**Solution:**
- Ensure backend is running
- Check `VITE_SOCKET_URL` in `frontend/.env`
- Clear browser cache

#### Blank Page After Login
**Solution:**
- Open browser console (F12)
- Check for errors
- Verify token is stored in localStorage
- Try clearing localStorage and logging in again

### Test Issues

#### Tests Timeout
```
Error: Timeout - Async callback was not invoked within timeout
```
**Solution:**
- Tests use in-memory MongoDB (might be slow on first run)
- Increase timeout in `jest.config.js`
- Check MongoDB Memory Server is installed

#### Cannot Find Module
```
Error: Cannot find module './setup'
```
**Solution:**
- Ensure `__tests__/setup.ts` exists
- Run `npm install` in backend directory

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write tests for new features
- Use DTOs for all API inputs/outputs
- Follow the existing code structure
- Add JSDoc comments for functions

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **SleekFlow Team** - Initial work

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Express.js and Node.js communities
- MongoDB for the flexible database
- Socket.io for real-time capabilities
- All open-source contributors

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

---

   

