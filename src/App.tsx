import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ShopLayout from './components/ShopLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ModManagement from './pages/ModManagement';
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="mods" element={<ModManagement />} />
        </Route>
        <Route path="/shop" element={<ShopLayout />}>
          <Route index element={<Shop />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
        <Route path="/inventory" element={<ShopLayout />}>
          <Route index element={<Inventory />} />
        </Route>
        <Route path="/" element={<Navigate to="/shop" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
