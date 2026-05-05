import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home/Home";
import Learn from "./pages/Learn/Learn";
import Profile from "./pages/Profile/Profile";
import VAKTest from "./pages/VAKTest/VAKTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/vak" element={<VAKTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;