import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Composant de chargement global pour le Lazy Loading
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen w-full bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>
);

// --- Pages Client (Lazy Loaded) ---
const LandingPage = React.lazy(() => import('./pages/client/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/client/AuthPage'));
const SearchTripsPage = React.lazy(() => import('./pages/client/SearchTripsPage'));
const BookingFlow = React.lazy(() => import('./pages/client/BookingFlow'));
const TicketPage = React.lazy(() => import('./pages/client/TicketPage'));
const StudentDashboard = React.lazy(() => import('./pages/client/StudentDashboard'));
const PaymentSuccessPage = React.lazy(() => import('./pages/client/PaymentSuccessPage'));
const PaymentCancelPage = React.lazy(() => import('./pages/client/PaymentCancelPage'));
const PaymentMockPage = React.lazy(() => import('./pages/client/PaymentMockPage'));
const ProfilePage = React.lazy(() => import('./pages/client/ProfilePage'));
const PrivacyPage = React.lazy(() => import('./pages/client/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/client/TermsPage'));
const SendPackagePage = React.lazy(() => import('./pages/client/SendPackagePage'));
const MyPackagesPage = React.lazy(() => import('./pages/client/MyPackagesPage'));

// --- Pages Admin (Lazy Loaded) ---
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const TicketScannerPage = React.lazy(() => import('./pages/admin/TicketScannerPage'));
const TicketVerifyPage = React.lazy(() => import('./pages/admin/TicketVerifyPage'));
const TripsManagementPage = React.lazy(() => import('./pages/admin/TripsManagementPage'));
const BusManagementPage = React.lazy(() => import('./pages/admin/BusManagementPage'));
const UsersManagementPage = React.lazy(() => import('./pages/admin/UsersManagementPage'));
const ReservationsManagementPage = React.lazy(() => import('./pages/admin/ReservationsManagementPage'));
const FinanceManagementPage = React.lazy(() => import('./pages/admin/FinanceManagementPage'));
const PackagesManagementPage = React.lazy(() => import('./pages/admin/PackagesManagementPage'));
const ReviewsManagementPage = React.lazy(() => import('./pages/admin/ReviewsManagementPage'));
const ComplaintsManagementPage = React.lazy(() => import('./pages/admin/ComplaintsManagementPage'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
              <Route path="send-package" element={<ProtectedRoute><SendPackagePage /></ProtectedRoute>} />
              <Route path="my-packages" element={<ProtectedRoute><MyPackagesPage /></ProtectedRoute>} />
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
              <Route path="complaints" element={<ComplaintsManagementPage />} />
              {/* We will add more admin routes here later */}
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
