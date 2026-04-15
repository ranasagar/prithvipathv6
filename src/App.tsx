import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { StyleProvider } from "./components/StyleProvider";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import AdminEditor from "./pages/AdminEditor";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AdminCategories from "./pages/AdminCategories";
import AdminAds from "./pages/AdminAds";
import AdminMenu from "./pages/AdminMenu";
import AdminSetupGuide from "./pages/AdminSetupGuide";
import AdminPageBuilder from "./pages/AdminPageBuilder";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import DistrictPage from "./pages/DistrictPage";
import LivePage from "./pages/LivePage";
import AdminArticles from "./pages/AdminArticles";
import SearchPage from "./pages/SearchPage";
import TrendingPage from "./pages/TrendingPage";
import LatestNewsPage from "./pages/LatestNewsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminCommunity from "./pages/AdminCommunity";
import CommunityPage from "./pages/CommunityPage";
import CommunityPostPage from "./pages/CommunityPostPage";
import EventsPage from "./pages/EventsPage";
import EventPostPage from "./pages/EventPostPage";
import ModelsPage from "./pages/ModelsPage";
import ModelProfilePage from "./pages/ModelProfilePage";
import AdminEvents from "./pages/AdminEvents";
import AdminEventEditor from "./pages/AdminEventEditor";
import AdminModels from "./pages/AdminModels";
import AdminInquiries from "./pages/AdminInquiries";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/layout/ScrollToTop";
import ScrollProgress from "./components/ui/ScrollProgress";

export default function App() {
  return (
    <StyleProvider>
      <Router>
        <ScrollProgress />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/post/:id" element={<CommunityPostPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventPostPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/models/:id" element={<ModelProfilePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/community" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminCommunity />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminEvents />
            </ProtectedRoute>
          } />
          <Route path="/admin/models" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminModels />
            </ProtectedRoute>
          } />
          <Route path="/admin/inquiries" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminInquiries />
            </ProtectedRoute>
          } />
          <Route path="/admin/events/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminEventEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/events/new" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminEventEditor />
            </ProtectedRoute>
          } />
          
          {/* Editor Routes */}
          <Route path="/editor" element={
            <ProtectedRoute allowedRoles={['editor']}>
              <EditorDashboard />
            </ProtectedRoute>
          } />

          {/* Shared Admin/Editor Routes */}
          <Route path="/admin/articles" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminArticles />
            </ProtectedRoute>
          } />
          <Route path="/admin/editor" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/editor/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'editor']}>
              <AdminEditor />
            </ProtectedRoute>
          } />

          {/* Admin Only Specific Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/ads" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAds />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMenu />
            </ProtectedRoute>
          } />
          <Route path="/admin/setup-guide" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSetupGuide />
            </ProtectedRoute>
          } />
          <Route path="/admin/page-builder" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPageBuilder />
            </ProtectedRoute>
          } />

          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/district/:districtName" element={<DistrictPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/latest" element={<LatestNewsPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile/:uid" element={<ProfilePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StyleProvider>
  );
}
