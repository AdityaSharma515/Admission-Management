import React from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AdmissionProvider } from './context/AdmissionContext';
import { HomePage } from './pages/HomePage';
import { LoginRegisterPage } from './pages/LoginRegisterPage';
import { DashboardPage } from './pages/DashboardPage';

const AppContent = () => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  const [showAuth, setShowAuth] = React.useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (isAuthenticated) {
    return <DashboardPage />;
  }

  // Show login/register page if user clicked "Get Started"
  if (showAuth) {
    return <LoginRegisterPage />;
  }

  // Show homepage by default
  return <HomePage onGetStarted={() => setShowAuth(true)} />;
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
