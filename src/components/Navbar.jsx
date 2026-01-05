import React from 'react';
import { useAuth } from '../hooks/useContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-lg font-bold">IIIT Dharwad Admission</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-secondary hover:bg-red-600 rounded text-white transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
