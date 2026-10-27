import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Projects from './pages/Projects.jsx';
import Register from './pages/Register.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private pages: ProtectedRoute redirects to /login when not signed in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
