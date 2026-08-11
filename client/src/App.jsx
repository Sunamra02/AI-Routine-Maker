import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateRoutine from './pages/CreateRoutine';
import MyRoutine from './pages/MyRoutine';
import Progress from './pages/Progress';
import Login from './pages/Login';
import './App.css';

/**
 * Main App Component
 * Connects React Router routes and structural layout (Navbar & Footer).
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-routine" element={<CreateRoutine />} />
            <Route path="/my-routine" element={<MyRoutine />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
