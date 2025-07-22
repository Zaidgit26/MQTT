import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import LoginPage from './Pages/LoginPage';
import MasterPage1 from './Pages/MasterPage1';
import MasterPage2 from './Pages/MasterPage2';
import Devices from './Pages/Devices';
import MasterPage3 from './Pages/MasterPage3';
import MasterPage4 from './Pages/MasterPage4';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes (hardcoded for now - should be properly secured) */}
            <Route path="/master" element={<MasterPage1/>} />
            <Route path="/usercreation" element={<MasterPage2 />} />
            <Route path="/devices" element={<Devices/>} />
            <Route path="/passwordreset" element={<MasterPage3 />} />

            {/* Protected user routes */}
            <Route
              path="/connecteddevices"
              element={
                <ProtectedRoute requireAuth={true}>
                  <MasterPage4 />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#74c476',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Go Home
                  </button>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
