import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import InstructionsPage from './pages/InstructionsPage';
import ExamPage from './pages/ExamPage';
import SubmittedPage from './pages/SubmittedPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/submitted" element={<SubmittedPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
