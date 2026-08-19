import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthPage from './pages/client/AuthPage';
import DashboardPage from './pages/admin/DashboardPage';
import TicketScannerPage from './pages/admin/TicketScannerPage';
import TicketVerifyPage from './pages/admin/TicketVerifyPage';
import TripsManagementPage from './pages/admin/TripsManagementPage';
import BusManagementPage from './pages/admin/BusManagementPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import ReservationsManagementPage from './pages/admin/ReservationsManagementPage';
import FinanceManagementPage from './pages/admin/FinanceManagementPage';
import PackagesManagementPage from './pages/admin/PackagesManagementPage';
import ReviewsManagementPage from './pages/admin/ReviewsManagementPage';
import SearchTripsPage from './pages/client/SearchTripsPage';
import BookingFlow from './pages/client/BookingFlow';
import TicketPage from './pages/client/TicketPage';
import LandingPage from './pages/client/LandingPage';
import StudentDashboard from './pages/client/StudentDashboard';
import PaymentSuccessPage from './pages/client/PaymentSuccessPage';
import PaymentCancelPage from './pages/client/PaymentCancelPage';
import PaymentMockPage from './pages/client/PaymentMockPage';
import ProfilePage from './pages/client/ProfilePage';
import PrivacyPage from './pages/client/PrivacyPage';
import TermsPage from './pages/client/TermsPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="search" element={<SearchTripsPage />} />
            <Route path="book/:id" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
            <Route path="ticket/:id" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path="payment-cancel" element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />
            <Route path="payment-mock" element={<PaymentMockPage />} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            {/* Fallback for cached old links */}
            <Route path="tickets" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="verify/scan" element={<TicketScannerPage />} />
            <Route path="verify/:id" element={<TicketVerifyPage />} />
            <Route path="trips" element={<TripsManagementPage />} />
            <Route path="buses" element={<BusManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="packages" element={<PackagesManagementPage />} />
            <Route path="reservations" element={<ReservationsManagementPage />} />
            <Route path="finance" element={<FinanceManagementPage />} />
            <Route path="reviews" element={<ReviewsManagementPage />} />
            {/* We will add more admin routes here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
