import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import UserInfo from './components/UserInfo';
import Dashboard from './components/Dashboard';

function MainContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <p>Загрузка...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Show login form only when user is not authenticated */}
      {!user && (
        <header className="App-header">
          <h1>Добро пожаловать в Расходы</h1>
          <div className="auth-section">
            <LoginForm />
          </div>
        </header>
      )}

      {/* Show user info and dashboard when authenticated */}
      {user && (
        <div className="app-container">
          <header className="app-header-bar">
            <h1>Финансовые записи</h1>
            <UserInfo />
          </header>
          <main className="main-content">
            <Dashboard />
          </main>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
