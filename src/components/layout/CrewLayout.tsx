import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CrewLayout: React.FC = () => {
  const { user, signOut } = useAuth();

  // Redirect if not crew
  if (user?.role !== 'crew') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This area is only for crew members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="bg-card/50 border-b border-border/50">
        <div className="minimal-container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-foreground">Crew Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name || user?.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="minimal-container minimal-section pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default CrewLayout;
