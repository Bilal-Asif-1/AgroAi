import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FarmPage from './pages/FarmPage';
import Inventory from './pages/Inventory';
import WeatherForecast from './pages/WeatherForecast';
import PestControl from './pages/PestControl';
import MarketPrices from './pages/MarketPrices';
import Education from './pages/Education';
import Contact from './pages/Contact';
import { LayoutDashboard, Cloud, BadgeDollarSign, GraduationCap, Package, Brain, Sprout, Mail } from 'lucide-react';

const navItems = [
  { path: '/dashboard', name: 'nav.dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/farms', name: 'nav.farms', icon: <Sprout className="w-5 h-5" /> },
  { path: '/inventory', name: 'nav.inventory', icon: <Package className="w-5 h-5" /> },
  { path: '/pest-control', name: 'nav.pestControl', icon: <Brain className="w-5 h-5" /> },
  { path: '/weather', name: 'nav.weather', icon: <Cloud className="w-5 h-5" /> },
  { path: '/market', name: 'nav.market', icon: <BadgeDollarSign className="w-5 h-5" /> },
  { path: '/education', name: 'nav.education', icon: <GraduationCap className="w-5 h-5" /> },
  { path: '/contact', name: 'nav.contact', icon: <Mail className="w-5 h-5" /> },
];

const MainLayout = () => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar items={navItems} />
    <main className="flex-1 overflow-auto p-6">
      <Outlet />
    </main>
  </div>
);

const App = () => (
  <Provider store={store}>
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (not nested under /) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>
          <Route
            path="/farms"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FarmPage />} />
          </Route>
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Inventory />} />
          </Route>
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WeatherForecast />} />
          </Route>
          <Route
            path="/pest-control"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PestControl />} />
          </Route>
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MarketPrices />} />
          </Route>
          <Route
            path="/education"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Education />} />
          </Route>
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Contact />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </LanguageProvider>
  </Provider>
);

export default App;