import React, { useState } from 'react';
import { useAuth } from './auth.jsx';
import AuthView from './components/AuthView.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardView from './components/DashboardView.jsx';
import StudyView from './components/StudyView.jsx';
import HistoryView from './components/HistoryView.jsx';
import AdminView from './components/AdminView.jsx';

export default function App() {
  const { user, ready } = useAuth();
  const [route, setRoute] = useState({ name: 'dashboard' });

  if (!ready) return null;
  if (!user) return <AuthView />;

  return (
    <div className="app-shell">
      <Navbar route={route} onNavigate={setRoute} />
      <main className="container">
        {route.name === 'dashboard' && <DashboardView onStudy={(deck) => setRoute({ name: 'study', deck })} />}
        {route.name === 'study' && <StudyView deck={route.deck} onBack={() => setRoute({ name: 'dashboard' })} />}
        {route.name === 'history' && <HistoryView />}
        {route.name === 'admin' && <AdminView />}
      </main>
    </div>
  );
}
