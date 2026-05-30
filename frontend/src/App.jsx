import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ContentDetail from './pages/ContentDetail';
import MyLibrary from './pages/MyLibrary';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminContents from './pages/admin/Contents';
import AddContent from './pages/admin/AddContent';
import AdminPurchases from './pages/admin/Purchases';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="contents" element={<ProtectedRoute adminOnly><AdminContents /></ProtectedRoute>} />
          <Route path="contents/add" element={<ProtectedRoute adminOnly><AddContent /></ProtectedRoute>} />
          <Route path="contents/edit/:id" element={<ProtectedRoute adminOnly><AddContent /></ProtectedRoute>} />
          <Route path="purchases" element={<ProtectedRoute adminOnly><AdminPurchases /></ProtectedRoute>} />
        </Route>

        <Route path="/" element={<><Navbar /><main className="flex-1"><Home /></main><Footer /></>} />
        <Route path="/catalog" element={<><Navbar /><main className="flex-1"><Catalog /></main><Footer /></>} />
        <Route path="/content/:id" element={<><Navbar /><main className="flex-1"><ContentDetail /></main><Footer /></>} />
        <Route path="/login" element={<><Navbar /><main className="flex-1"><Login /></main><Footer /></>} />
        <Route path="/register" element={<><Navbar /><main className="flex-1"><Register /></main><Footer /></>} />
        <Route path="/library" element={<><Navbar /><main className="flex-1"><ProtectedRoute><MyLibrary /></ProtectedRoute></main><Footer /></>} />
      </Routes>
    </div>
  );
}

export default App;
