import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import AuthSurface from "./pages/Auth/AuthSurface";
import Home from "./pages/Home/Home";
import Learn from "./pages/Learn/Learn";
import LessonView from "./pages/Learn/LessonView";
import Profile from "./pages/Profile/Profile";
import VAKTest from "./pages/VAKTest/VAKTest";
import Subjects from "./pages/Subjects/Subjects";
import Landing from "./pages/Landing/Landing";

function ProtectedRoute({ element }) {
  const { isAuthenticated, hasVAKType } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasVAKType && location.pathname !== "/vak") return <Navigate to="/vak" replace />;
  return element;
}

// Un componente wrapper para usar useLocation
function AppContent() {
  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthSurface mode="login" />} />
        <Route path="/register" element={<AuthSurface mode="register" />} />

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