import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormBuilder } from './components/builder/FormBuilder';
import { LiveFormView } from './components/builder/LiveFormView';
import { Dashboard } from './components/dashboard/Dashboard';
import { SubmissionsView } from './components/dashboard/SubmissionsView';
import { Settings } from './components/dashboard/Settings';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { ToastProvider } from './components/ui/ToastContext';
import { CommandMenu } from './components/ui/CommandMenu';

function App() {
  return (
    <ToastProvider>
      <Router>
        <CommandMenu />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public Live Form Route */}
          <Route path="/form/:id" element={<LiveFormView />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:id/submissions" element={<SubmissionsView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/builder/:id" element={<FormBuilder />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
