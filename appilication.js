// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import MemberCard from './components/MemberCard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* The :id param corresponds to the member's uniqueId */}
        <Route path="/member/:id" element={<MemberCard />} />
      </Routes>
    </Router>
  );
}

export default App;