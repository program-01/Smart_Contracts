import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainDashboard from "./MainDashboard";
import AdminPanel from "./AdminPanel";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#111" }}>
        <Link to="/" style={{ marginRight: "1rem", color: "#0af" }}>Home</Link>
        <Link to="/admin" style={{ color: "#0af" }}>Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;