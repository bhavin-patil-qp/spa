import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Articles from './pages/Articles';
import MarkdownViewer from './pages/MarkdownViewer';
import JsonViewer from './pages/JsonViewer';
import RichEditor from './pages/RichEditor';
import DiffViewer from './pages/DiffViewer';
import TimeConverter from './pages/TimeConverter';
import ColorTools from './pages/ColorTools';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="layout">
        <div className="header">HOST HEADER — SHOULD NOT MOVE</div>
        <Navbar />
        <main className="layout-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/markdown" element={<MarkdownViewer />} />
          <Route path="/json" element={<JsonViewer />} />
          <Route path="/editor" element={<RichEditor />} />
          <Route path="/diff" element={<DiffViewer />} />
          <Route path="/time" element={<TimeConverter />} />
          <Route path="/color" element={<ColorTools />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
