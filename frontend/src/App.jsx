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
import CentreAide from './pages/CentreAide';
import NousContacter from './pages/NousContacter';
import FAQ from './pages/FAQ';
import Signalement from './pages/Signalement';
import Temoignages from './pages/Temoignages';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminContents from './pages/admin/Contents';
import AddContent from './pages/admin/AddContent';
import AdminPurchases from './pages/admin/Purchases';
import AdminCategories from './pages/admin/Categories';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminSettings from './pages/admin/Settings';
import CoursPython from './pages/CoursPython';
import AdminCourses from './pages/admin/Courses';
import AdminCourseForm from './pages/admin/CourseForm';
import AdminLessons from './pages/admin/Lessons';
import AdminForumManager from './pages/admin/ForumManager';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminCertificates from './pages/admin/Certificates';
import AdminQuizManager from './pages/admin/QuizManager';
import AdminCourseQuizManager from './pages/admin/CourseQuizManager';

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
          <Route path="categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
          <Route path="testimonials" element={<ProtectedRoute adminOnly><AdminTestimonials /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
          <Route path="courses" element={<ProtectedRoute adminOnly><AdminCourses /></ProtectedRoute>} />
          <Route path="courses/add" element={<ProtectedRoute adminOnly><AdminCourseForm /></ProtectedRoute>} />
          <Route path="courses/edit/:id" element={<ProtectedRoute adminOnly><AdminCourseForm /></ProtectedRoute>} />
          <Route path="courses/:id/lessons" element={<ProtectedRoute adminOnly><AdminLessons /></ProtectedRoute>} />
          <Route path="forum" element={<ProtectedRoute adminOnly><AdminForumManager /></ProtectedRoute>} />
          <Route path="courses/:id/quizzes" element={<ProtectedRoute adminOnly><AdminCourseQuizManager /></ProtectedRoute>} />
          <Route path="courses/:id/enrollments" element={<ProtectedRoute adminOnly><AdminEnrollments /></ProtectedRoute>} />
          <Route path="lessons/:lessonId/quiz" element={<ProtectedRoute adminOnly><AdminQuizManager /></ProtectedRoute>} />
          <Route path="certificates" element={<ProtectedRoute adminOnly><AdminCertificates /></ProtectedRoute>} />
        </Route>

        <Route path="/" element={<><Navbar /><main className="flex-1"><Home /></main><Footer /></>} />
        <Route path="/catalog" element={<><Navbar /><main className="flex-1"><Catalog /></main><Footer /></>} />
        <Route path="/content/:id" element={<><Navbar /><main className="flex-1"><ContentDetail /></main><Footer /></>} />
        <Route path="/login" element={<><Navbar /><main className="flex-1"><Login /></main><Footer /></>} />
        <Route path="/register" element={<><Navbar /><main className="flex-1"><Register /></main><Footer /></>} />
        <Route path="/library" element={<><Navbar /><main className="flex-1"><ProtectedRoute><MyLibrary /></ProtectedRoute></main><Footer /></>} />
        <Route path="/aide" element={<><Navbar /><main className="flex-1"><CentreAide /></main><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><main className="flex-1"><NousContacter /></main><Footer /></>} />
        <Route path="/faq" element={<><Navbar /><main className="flex-1"><FAQ /></main><Footer /></>} />
        <Route path="/signalement" element={<><Navbar /><main className="flex-1"><Signalement /></main><Footer /></>} />
        <Route path="/temoignages" element={<><Navbar /><main className="flex-1"><Temoignages /></main><Footer /></>} />
        <Route path="/cours-python" element={<><Navbar /><main className="flex-1"><CoursPython /></main><Footer /></>} />
      </Routes>
    </div>
  );
}

export default App;
