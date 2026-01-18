import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import Reviews from './pages/Reviews';
import { 
  AdminDashboard, 
  AdminUsers, 
  AdminListings, 
  AdminPending, 
  AdminReports,
  AdminReviews
} from './pages/admin';
import './App.css';

// Separate component to access useLocation hook inside Router
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Admin routes have their own layout
  if (isAdminRoute) {
    return (
      <Routes location={location}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/pending" element={<AdminPending />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
      </Routes>
    );
  }
  
  return (
    <div className="App">
      <Header />
      <main>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/reviews" element={<Reviews />} />
          </Routes>
        </PageTransition>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Thuê Trọ Giá Rẻ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
