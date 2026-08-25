<div align="center">
  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop" alt="Kids learning" width="100%" style="border-radius: 15px; margin-bottom: 20px;"/>

  # ✨ ApPrender: Adaptive Learning for Kids ✨

  <p>A full-stack educational platform designed for primary school students. Reinforces mathematics and English by adapting to each child's learning style (Visual, Auditory, or Kinesthetic).</p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BA5?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </div>
</div>

---

## 🚀 Key Features

*   🧠 **Built-in VAK Test:** Upon registration, children take a short assessment to discover their predominant learning style.
*   🎯 **Personalized Content:** The backend system classifies and delivers tailored lessons (with images, audio, or games) based on whether the student is Visual, Auditory, or Kinesthetic.
*   🎮 **Gamification:** XP (Experience Points), daily streaks, and real-time progress tracking to keep kids motivated.
*   🔒 **Security & Authentication:** Accounts protected with JSON Web Tokens (JWT) and passwords encrypted with Bcrypt.

## 📁 Project Structure

The repository is divided into two main parts:

*   `/client` - Frontend built with **React** and **Vite**, using CSS Modules and a Mobile-First design with colorful kid-friendly interfaces.
*   `/server` - RESTful API backend built with **Node.js** and **Express** using a NoSQL **MongoDB** database.

## 🛠️ Prerequisites

Before getting started, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or a MongoDB Atlas account)

## 💻 Installation & Local Setup

Follow these steps to run the project on your computer:

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd math-english-kids
```

### 2. Set up the Backend (Server)
```bash
cd server
npm install
```
Create a file called `.env` in the `server` folder and add your environment variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/edukids  # Replace with your Mongo Atlas URI if needed
JWT_SECRET=your_super_secure_secret
CLIENT_URL=http://localhost:5173
```
Seed the database with default lessons and start the server:
```bash
npm run seed     # (Optional) Populates the DB with initial content
npm run dev      # Starts the Node server in development mode
```

### 3. Set up the Frontend (Client)
In a new terminal window, navigate to the client folder:
```bash
cd client
npm install
npm run dev
```

The web application will be available at [http://localhost:5173](http://localhost:5173).

---
<div align="center">
  <i>Built with ❤️ to transform primary education.</i>
</div>
