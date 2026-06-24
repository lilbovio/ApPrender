import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home/Home";
import Learn from "./pages/Learn/Learn";
import LessonView from "./pages/Learn/LessonView";
import Profile from "./pages/Profile/Profile";
import VAKTest from "./pages/VAKTest/VAKTest";
import ThemeToggle from "./components/common/ThemeToggle";
import Subjects from "./pages/Subjects/Subjects";

/**
 * ProtectedRoute — Simula protección sin backend real
 * Si no hay token en localStorage, redirige a login
 */
function ProtectedRoute({ element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) return <div>Cargando...</div>;
  return isAuthenticated ? element : <Navigate to="/" />;
}

// Un componente wrapper para usar useLocation
function AppContent() {
  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/learn" element={<ProtectedRoute element={<Learn />} />} />
        <Route path="/learn/lesson/:lessonId" element={<ProtectedRoute element={<LessonView />} />} />
        <Route path="/subjects" element={<ProtectedRoute element={<Subjects />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/vak" element={<ProtectedRoute element={<VAKTest />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Dark Mode Toggle - Fixed position top-right */}
      <ThemeToggle />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;