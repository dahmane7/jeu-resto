import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';
import CaisseLayout from './components/layouts/CaisseLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import RestaurantHome from './pages/public/RestaurantHome';
import Form from './pages/public/Form';
import Wheel from './pages/public/Wheel';
import Result from './pages/public/Result';
import AdminDashboard from './pages/admin/Dashboard';
import CaisseMode from './pages/caisse/CaisseMode';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import Prizes from './pages/restaurant/Prizes';
import Clients from './pages/restaurant/Clients';

// Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques - Parcours client */}
          <Route
            path="/r/:slug"
            element={
              <PublicLayout>
                <RestaurantHome />
              </PublicLayout>
            }
          />
          <Route
            path="/r/:slug/form"
            element={
              <PublicLayout>
                <Form />
              </PublicLayout>
            }
          />
          <Route
            path="/r/:slug/wheel"
            element={
              <PublicLayout>
                <Wheel />
              </PublicLayout>
            }
          />
          <Route
            path="/r/:slug/result"
            element={
              <PublicLayout>
                <Result />
              </PublicLayout>
            }
          />

          {/* Route de login */}
          <Route path="/login" element={<Login />} />

          {/* Routes protégées - Super Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Routes protégées - Admin Restaurant */}
          <Route
            path="/restaurant/:id/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN_RESTAURANT']}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<RestaurantDashboard />} />
                    <Route path="prizes" element={<Prizes />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Route protégée - Staff Caisse */}
          <Route
            path="/caisse"
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <CaisseLayout>
                  <CaisseMode />
                </CaisseLayout>
              </ProtectedRoute>
            }
          />

          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
