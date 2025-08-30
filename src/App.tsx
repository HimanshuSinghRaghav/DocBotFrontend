import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineProvider } from './contexts/OfflineContext';
import AuthGuard from './components/auth/AuthGuard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminDashboard from './pages/AdminDashboard';
import ShiftLeadDashboard from './pages/ShiftLeadDashboard';
import CrewDashboard from './pages/CrewDashboard';
import CrewLessons from './pages/CrewLessons';
import LessonDetail from './pages/LessonDetail';
import CrewQuiz from './pages/CrewQuiz';
import QuizDetail from './pages/QuizDetail';
import CrewChat from './pages/CrewChat';
import CrewLayout from './components/layout/CrewLayout';
import ChatInterface from './pages/ChatInterface';
import ProcedureMode from './pages/ProcedureMode';
import QuizPage from './pages/QuizPage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <OfflineProvider>
          <Router>
            <div className="w-full h-full min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                {/* <Route path="/login/clark" element={<ClarkLoginPage />} /> */}
                {/* <Route path="/login/clark/callback" element={<ClarkLoginPage />} /> */}
                <Route
                  path="/admin/*"
                  element={
                    <AuthGuard allowedRoles={['admin']}>
                      <AdminDashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/shift-lead/*"
                  element={
                    <AuthGuard allowedRoles={['admin', 'shift_lead']}>
                      <ShiftLeadDashboard />
                    </AuthGuard>
                  }
                />
                   <Route path="admin/lessons" element={<CrewLessons />} />
                  <Route path="admin/lesson/:lessonId" element={<LessonDetail />} />
                  <Route path="admin/quiz" element={<CrewQuiz />} />
                  <Route path="admin/quiz/:quizId" element={<QuizDetail />} />
                <Route
                  path="/crew/*"
                  element={
                    <AuthGuard allowedRoles={['admin', 'shift_lead', 'crew']}>
                      <CrewLayout />
                    </AuthGuard>
                  }
                >
                  <Route index element={<CrewDashboard />} />
                  <Route path="lessons" element={<CrewLessons />} />
                  <Route path="lesson/:lessonId" element={<LessonDetail />} />
                  <Route path="quiz" element={<CrewQuiz />} />
                  <Route path="quiz/:quizId" element={<QuizDetail />} />
                  <Route path="chat" element={<CrewChat />} />
                </Route>
                <Route
                  path="/chat"
                  element={
                    <AuthGuard allowedRoles={['admin', 'shift_lead', 'crew']}>
                      <ChatInterface />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/procedures"
                  element={
                    <AuthGuard allowedRoles={['admin', 'shift_lead', 'crew']}>
                      <ProcedureMode />
                    </AuthGuard>
                  }
                />
                
                <Route
                  path="/documents/upload"
                  element={
                    <AuthGuard allowedRoles={['admin', 'shift_lead']}>
                      <DocumentUploadPage />
                    </AuthGuard>
                  }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </OfflineProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;