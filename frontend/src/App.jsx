import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VoiceGuideListener } from './components/VoiceGuideListener';
import SkyBackdrop from './components/SkyBackdrop';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Courses from './pages/Courses';
import CoursePlayer from './pages/CoursePlayer';
import Checkpoint from './pages/Checkpoint';
import Certificate from './pages/Certificate';
import Profile from './pages/Profile';
import VoicePracticePage from './pages/VoicePracticePage';
import League from './pages/League';
import Community from './pages/Community';
import WritingPracticePage from './pages/WritingPracticePage';
import './i18n';

export default function App() {
  return (
    <AuthProvider>
      <SkyBackdrop />
      <VoiceGuideListener />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/league" element={<League />} />
            <Route path="/community" element={<Community />} />
            <Route path="/voice-practice" element={<VoicePracticePage />} />
            <Route path="/writing-practice" element={<WritingPracticePage />} />
            <Route path="/course/:id" element={<CoursePlayer />} />
            <Route path="/checkpoint/:courseId" element={<Checkpoint />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
