import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddCompany from './pages/AddCompany';
import CompanyDetail from './pages/CompanyDetail';
import AddReview from './pages/AddReview';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-company" element={<AddCompany />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/company/:id/add-review" element={<AddReview />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
