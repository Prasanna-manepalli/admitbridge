import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentApplications from './pages/student/StudentApplications';
import UniversityList from './pages/universities/UniversityList';
import AdminDashboard from './pages/admin/AdminDashboard';
import ConsultantLayout from './pages/consultant/ConsultantLayout';
import { ConsultantProvider } from './pages/consultant/ConsultantContext';
import Dashboard from './pages/consultant/Dashboard';
import MyProfile from './pages/consultant/MyProfile';
import Services from './pages/consultant/Services';
import PublicProfilePreview from './pages/consultant/PublicProfilePreview';
import AccountSettings from './pages/consultant/AccountSettings';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to their default dashboard or home
  }

  return children;
};

// Route director
const HomeDirector = () => {
  const { user } = React.useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'student': return <Navigate to="/student/dashboard" replace />;
    case 'consultant': return <Navigate to="/consultant/dashboard" replace />;
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeDirector />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/universities" element={
            <ProtectedRoute>
              <UniversityList />
            </ProtectedRoute>
          } />
          
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student/applications" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentApplications />
            </ProtectedRoute>
          } />

          <Route path="/consultant" element={
            <ProtectedRoute allowedRoles={['consultant', 'admin']}>
              <ConsultantProvider>
                <ConsultantLayout />
              </ConsultantProvider>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/consultant/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="services" element={<Services />} />
            <Route path="public-preview" element={<PublicProfilePreview />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
