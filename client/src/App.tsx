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
import SearchTripsPage from './pages/client/SearchTripsPage';
import BookingFlow from './pages/client/BookingFlow';
import TicketPage from './pages/client/TicketPage';
import LandingPage from './pages/client/LandingPage';
import StudentDashboard from './pages/client/StudentDashboard';
import ProfilePage from './pages/client/ProfilePage';
import PrivacyPage from './pages/client/PrivacyPage';
import TermsPage from './pages/client/TermsPage';
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
            <Route path="book/:id" element={<BookingFlow />} />
            <Route path="ticket/:id" element={<TicketPage />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="verify/scan" element={<TicketScannerPage />} />
            <Route path="verify/:id" element={<TicketVerifyPage />} />
            <Route path="trips" element={<TripsManagementPage />} />
            <Route path="buses" element={<BusManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="reservations" element={<ReservationsManagementPage />} />
            <Route path="finance" element={<FinanceManagementPage />} />
            {/* We will add more admin routes here later */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
