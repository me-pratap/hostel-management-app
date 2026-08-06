import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { Tenants } from './pages/Tenants';
import { AddTenant } from './pages/AddTenant';
import { TenantProfile } from './pages/TenantProfile';
import { EditTenant } from './pages/EditTenant';
import { Payments } from './pages/Payments';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenants/new" element={<AddTenant />} />
              <Route path="tenants/:id" element={<TenantProfile />} />
              <Route path="tenants/:id/edit" element={<EditTenant />} />
              <Route path="payments" element={<Payments />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
