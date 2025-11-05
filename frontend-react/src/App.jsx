import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Results from "./pages/Results.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <div className="app-body">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">© 2025 Misinformation Detection Project</footer>
    </div>
  );
}
