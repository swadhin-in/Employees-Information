import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import MemberCard from './components/MemberCard';
import Login from './components/Login';

// Simple protection wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  // If token exists, show the dashboard, otherwise go to login
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* PUBLIC ROUTE: Member Profile */}
        <Route path="/member/:id" element={<MemberCard />} />

        {/* PROTECTED ROUTE: Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;