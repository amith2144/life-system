import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DashboardLayout from './pages/app/DashboardLayout';
import Today from './pages/app/Today';
import Areas from './pages/app/Areas';
import Habits from './pages/app/Habits';
import Goals from './pages/app/Goals';
import Capture from './pages/app/Capture';
import Weekly from './pages/app/Weekly';
import Planner from './pages/app/Planner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Today />} />
            <Route path="areas" element={<Areas />} />
            <Route path="habits" element={<Habits />} />
            <Route path="goals" element={<Goals />} />
            <Route path="capture" element={<Capture />} />
            <Route path="weekly" element={<Weekly />} />
            <Route path="planner" element={<Planner />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
