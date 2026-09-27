import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
// Add page imports here
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import RequireClinician from '@/components/layout/RequireClinician';
import Home from '@/pages/Home';
import QuestionnaireRunner from '@/pages/patient/QuestionnaireRunner';
import Notes from '@/pages/patient/Notes';
import PatientDetail from '@/pages/clinician/PatientDetail';
import ProblemTypes from '@/pages/clinician/ProblemTypes';
import Questionnaires from '@/pages/clinician/Questionnaires';
import QuestionnaireEditor from '@/pages/clinician/QuestionnaireEditor';
import TaskLibrary from '@/pages/clinician/TaskLibrary';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isPublicAuth = ["/login", "/register", "/forgot-password", "/reset-password"].includes(path);

  // Public auth screens must not wait on session (otherwise /login is a spinner).
  if (!isPublicAuth && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire/:id" element={<QuestionnaireRunner />} />
          <Route path="/notes" element={<Notes />} />
          <Route element={<RequireClinician />}>
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/problem-types" element={<ProblemTypes />} />
            <Route path="/questionnaires" element={<Questionnaires />} />
            <Route path="/questionnaires/:id" element={<QuestionnaireEditor />} />
            <Route path="/tasks" element={<TaskLibrary />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App