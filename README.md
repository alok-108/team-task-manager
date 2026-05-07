# TaskFlow – Team Task Manager

A full-stack team task management application with role-based access control, kanban boards, and real-time project collaboration.

🔗 **Live Demo:** [Add Railway URL here]

---

## ✨ Features

- **Authentication** – JWT-based signup/login with secure password hashing
- **Projects** – Create, update, delete projects with descriptions
- **Team Members** – Invite members by email, assign roles (admin/member)
- **Tasks** – Full CRUD with kanban-style board (To Do → In Progress → Done)
- **Role-Based Access Control**
  - **Project Admin**: Create/delete tasks, manage members, edit project
  - **Project Member**: View tasks, update status on assigned tasks
- **Dashboard** – Aggregated stats, completion rates, overdue tracking, upcoming deadlines
- **Responsive Design** – Works on desktop and mobile

## 🧰 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 (Vite), Lucide Icons    |
| Backend    | Node.js, Express.js              |
| Database   | MongoDB (Mongoose ODM)           |
| Auth       | JWT (jsonwebtoken + bcryptjs)     |
| Deployment | Railway                          |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Local Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd team-task-manager

# Install all dependencies
npm install
cd client && npm install && cd ..

# Create .env file in root
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# Run backend (port 5000)
npm run dev

# In another terminal, run frontend (port 5173)
cd client && npm run dev
```

### Environment Variables

| Variable     | Description                        |
|--------------|------------------------------------|
| `MONGO_URI`  | MongoDB connection string          |
| `JWT_SECRET` | Secret key for JWT signing         |
| `PORT`       | Server port (default: 5000)        |
| `NODE_ENV`   | `development` or `production`      |

## 📦 API Documentation

### Auth
| Method | Endpoint          | Access | Description     |
|--------|-------------------|--------|-----------------|
| POST   | `/api/auth/signup` | Public | Register        |
| POST   | `/api/auth/login`  | Public | Login (JWT)     |
| GET    | `/api/auth/me`     | Auth   | Current profile |

### Projects
| Method | Endpoint                           | Access        | Description      |
|--------|------------------------------------|---------------|------------------|
| POST   | `/api/projects`                    | Auth          | Create project   |
| GET    | `/api/projects`                    | Auth          | List my projects |
| GET    | `/api/projects/:id`                | Member        | Get project      |
| PUT    | `/api/projects/:id`                | Admin         | Update project   |
| DELETE | `/api/projects/:id`                | Admin         | Delete project   |
| POST   | `/api/projects/:id/members`        | Admin         | Add member       |
| DELETE | `/api/projects/:id/members/:userId`| Admin         | Remove member    |

### Tasks
| Method | Endpoint                                    | Access | Description   |
|--------|---------------------------------------------|--------|---------------|
| POST   | `/api/projects/:projectId/tasks`             | Admin  | Create task   |
| GET    | `/api/projects/:projectId/tasks`             | Member | List tasks    |
| PUT    | `/api/projects/:projectId/tasks/:taskId`     | Member | Update task   |
| DELETE | `/api/projects/:projectId/tasks/:taskId`     | Admin  | Delete task   |

### Dashboard
| Method | Endpoint         | Access | Description       |
|--------|------------------|--------|-------------------|
| GET    | `/api/dashboard`  | Auth   | Aggregated stats  |

## 🚢 Deployment (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
4. Railway auto-detects `railway.toml` and deploys

## 📁 Project Structure

```
team-task-manager/
├── server/
│   ├── config/db.js
│   ├── models/          (User, Project, Task)
│   ├── middleware/      (auth, projectAuth)
│   ├── controllers/     (auth, project, task, dashboard)
│   ├── routes/          (auth, projects, tasks, dashboard)
│   └── index.js
├── client/
│   └── src/
│       ├── context/     (AuthContext)
│       ├── components/  (Sidebar, ProtectedRoute)
│       ├── pages/       (Login, Register, Dashboard, Projects, ProjectDetail)
│       ├── api.js
│       └── App.jsx
├── .env
├── railway.toml
└── package.json
```

## 📄 License

MIT
