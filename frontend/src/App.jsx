import React from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AdmissionProvider } from './context/AdmissionContext';
import { HomePage } from './pages/HomePage';
import { LoginRegisterPage } from './pages/LoginRegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { VerifierDashboardPage } from './pages/VerifierDashboardPage';

const AppContent = () => {
  const { isAuthenticated, loading, user } = React.useContext(AuthContext);
  const [showAuth, setShowAuth] = React.useState(false);
  const [authDefaults, setAuthDefaults] = React.useState({ mode: 'login', role: 'STUDENT' });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <AdminDashboardPage />;
    }
    if (user?.role === 'VERIFIER') {
      return <VerifierDashboardPage />;
    }
    return <DashboardPage />;
  }

  // Show login/register page if user clicked "Get Started"
  if (showAuth) {
    return <LoginRegisterPage defaultMode={authDefaults.mode} defaultRole={authDefaults.role} />;
  }

  // Show homepage by default
  return (
    <HomePage
      onGetStarted={(opts) => {
        const nextDefaults = {
          mode: opts?.mode === 'register' ? 'register' : 'login',
          role: opts?.role || 'STUDENT'
        };
        setAuthDefaults(nextDefaults);
        setShowAuth(true);
      }}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <AdmissionProvider>
        <AppContent />
      </AdmissionProvider>
    </AuthProvider>
  );
}

export default App;
