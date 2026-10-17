import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IntroGate from './components/intro/IntroGate';
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <Router>
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<IntroGate><Home /></IntroGate>} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      </Suspense>
    </Router>
  );
}
