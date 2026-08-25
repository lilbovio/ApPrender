# 🎒 ApPrender (ApPrender) — Project Context

This file serves as a comprehensive reference of the project so that any new Artificial Intelligence (AI) model or developer can quickly understand its architecture, data flow, technologies, and file organization.

---

## 📌 Project Overview

**ApPrender** (also referred to as **ApPrender**) is an interactive and adaptive educational web platform designed for primary school children (generally ages 6 to 12). Its goal is to reinforce basic subjects like **Mathematics and English** by adapting the content format to each child's predominant learning style using the **VAK (Visual, Auditory, Kinesthetic) model**.

### 🧠 How Adaptability Works
1. **Style Assessment (VAK Test):** Upon registration, students take an interactive dynamic test with illustrated questions and answers. When completed, the system calculates whether the predominant learning style is **Visual**, **Auditory**, or **Kinesthetic**.
2. **Content Personalization:** Lessons are presented to the child in specific formats customized to their style:
   - **Visual:** Content rich in infographics, colors, diagrams, and detailed images.
   - **Auditory:** Narrated explanations, background sounds, educational podcasts, or voice-guided instructions.
   - **Kinesthetic:** Interactive activities, simulations, or "learning by doing" mechanics (games, drag-and-drop, etc.).
3. **Gamification:** To keep students engaged, the system rewards correct answers and completed lessons with **Experience Points (XP)**, daily active **Streaks**, and virtual **Badges**.

---

## 🛠️ Technology Stack

The project is built on a decoupled **Full-stack (MERN-like)** architecture:

### 💻 Frontend (Client)
- **Framework/Library:** React (with Vite as bundler).
- **Language:** JavaScript (JSX).
- **Styling:** CSS Modules and CSS variables supporting theme switching (Dark/Light mode and kid-friendly UI styling).
- **Routing:** `react-router-dom` for seamless Single Page Application (SPA) navigation.
- **Communication:** `fetch` client wrapped in a generic `apiRequest` utility.

### ⚙️ Backend (Server)
- **Runtime Environment:** Node.js.
- **Framework:** Express.js for building a RESTful API.
- **Database:** MongoDB (NoSQL document storage).
- **Data Modeling:** Mongoose (defining data models and schemas).
- **Security:**
  - `bcrypt` for password hashing.
  - `jsonwebtoken` (JWT) for secure authentication token generation.
  - `cors` for cross-origin resource sharing management.

---

## 📂 Project Directory Structure

The repository root is organized as follows:

```text
ApPrender/
├── client/                   # Frontend application (React + Vite)
│   ├── public/               # Global static resources (images, audio files, favicon)
│   ├── src/                  # React source code
│   │   ├── assets/           # Local images, vectors, and icons
│   │   ├── components/       # Reusable components organized by module
│   │   │   ├── common/       # Generic buttons, cards, and loaders
│   │   │   ├── lessons/      # Lesson renderers (specific to VAK learning styles)
│   │   │   ├── navbar/       # Interactive navigation menu
│   │   │   ├── progress/     # Progress bars, XP meters, and level displays
│   │   │   └── vak/          # Components for the interactive VAK Test
│   │   ├── context/          # Global State Management (Contexts)
│   │   │   ├── AuthContext.jsx    # Authentication state and tokens
│   │   │   ├── LessonContext.jsx  # Active lessons and progress state
│   │   │   └── ThemeContext.jsx   # Visual theme switcher (Light/Dark)
│   │   ├── hooks/            # Custom Hooks wrapping global contexts
│   │   │   ├── useAuth.js
│   │   │   ├── useLesson.js
│   │   │   └── useProgress.js
│   │   ├── pages/            # Main application views/pages
│   │   │   ├── Auth/         # Sign Up and Log In screens
│   │   │   ├── Home/         # Student Dashboard (Home page)
│   │   │   ├── Learn/        # Adapted active lesson interface
│   │   │   ├── Profile/      # History, unlocked badges, and user profile
│   │   │   ├── Subjects/     # Subject selection (Math, English)
│   │   │   └── VAKTest/      # VAK style assessment interface
│   │   ├── services/         # API clients for backend interaction
│   │   │   ├── api.js             # Base fetch request handler
│   │   │   ├── authService.js     # Auth services (login/register)
│   │   │   ├── lessonService.js   # Lesson loading services
│   │   │   ├── progressService.js # Progress updates, XP, and badges
│   │   │   └── userService.js     # User profile operations
│   │   ├── utils/            # Auxiliary utility functions
│   │   │   ├── gradeUtils.js      # Grade/level formatting utilities
│   │   │   ├── soundUtils.js      # UI sound effects manager
│   │   │   └── vakUtils.js        # VAK test scoring logic
│   │   ├── App.css           # Global application styles
│   │   ├── App.jsx           # Root component and protected routing rules
│   │   ├── index.css         # CSS reset and design system variables
│   │   └── main.jsx          # React app entry point
│   ├── eslint.config.js      # Linter configuration
│   ├── index.html            # Core HTML template
│   ├── package.json          # Frontend dependencies and run scripts
│   └── vite.config.js        # Vite configurations
│
├── server/                   # Backend application (Node.js + Express)
│   ├── src/                  # API source code
│   │   ├── config/           # Setup configurations (Database, etc.)
│   │   │   └── db.js              # MongoDB connector
│   │   ├── controllers/      # Business logic controllers per route
│   │   ├── data/             # Static seed data or initialization scripts
│   │   ├── middleware/       # Custom middlewares (JWT verification, error handler)
│   │   │   ├── authMiddleware.js  # Protects endpoints validating JWT
│   │   │   └── errorMiddleware.js # Global exception handling middleware
│   │   ├── models/           # Mongoose Schema definitions
│   │   │   ├── Badge.js           # Badges/Achievements schema
│   │   │   ├── Lesson.js          # Lessons and adaptive VAK content schema
│   │   │   ├── Progress.js        # Student learning progress tracker schema
│   │   │   ├── User.js            # User (Student/Parent) schema
│   │   │   └── VAKResult.js       # VAK test results schema
│   │   ├── routes/           # Endpoint-to-controller route mapping
│   │   │   ├── authRoutes.js
│   │   │   ├── lessonRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── vakRoutes.js
│   │   ├── services/         # Auxiliary business logic services
│   │   └── utils/            # Backend helpers (token generation, etc.)
│   ├── index.js              # Express app entry point
│   ├── package.json          # Backend dependencies and scripts (like seeding)
│   └── vercel.json           # Vercel deployment configuration
│
└── README.md                 # Quick-start developer setup guide
```

---

## 🔄 Data Flow and Communication

1. **Authentication:**
   - Registration and login requests hit `/api/auth/register` and `/api/auth/login`.
   - On success, the backend returns a JSON Web Token (JWT) along with basic user details.
   - The token is stored in the client's `localStorage` and automatically appended as `Authorization: Bearer <token>` in subsequent requests handled by `apiRequest` (`client/src/services/api.js`).

2. **Adaptive Lesson Flow:**
   - When a student navigates to a subject `/subjects`, the client requests lessons matching the criteria.
   - The `/api/lessons` API serves lessons custom-tailored to the student's profile learning style.
   - Based on `User.learningStyle`, the `Learn.jsx` view renders distinct styles of content (Visual utilizes diagrams, Auditory plays voice/audio assets, and Kinesthetic shows drag-and-drop or quiz mini-games).

3. **Progress Tracking & Gamification:**
   - Upon lesson or quiz completion, the client posts results to `/api/progress`.
   - The backend increments XP, recalculates level milestones, increments active streaks, and unlocks new `Badges` as applicable.
   - The client state refreshes to display feedback animations, updated level meters, or success modals.

---

## 🛠️ Developer & AI Guidelines

When extending or modifying this project, adhere to these rules:
- **Design Aesthetic:** Keep the UI game-like, clean, kid-friendly, and vibrant. Use styles declared in `client/src/index.css`.
- **VAK Adaptability:** Ensure new lessons support all three learning paths (Visual, Auditory, Kinesthetic) both in the frontend rendering code and database seeds.
- **Authorization Guarding:** Secure any student data, progress updates, or setting routes using the JWT backend middleware.
- **Error Handling:** Standardize user-friendly error banners or alerts for test inputs and credentials to prevent app dead-ends.
