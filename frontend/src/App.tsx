import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Achievements from './pages/Achievements';
import Goals from './pages/Goals';

// Context for global filter state between Sidebar and Pages
interface FilterContextType {
  selectedCategory: string | null;
  setSelectedCategory: (val: string | null) => void;
  habitType: 'good' | 'bad';
  setHabitType: (val: 'good' | 'bad') => void;
}

export const FilterContext = createContext<FilterContextType>({
  selectedCategory: null,
  setSelectedCategory: () => {},
  habitType: 'good',
  setHabitType: () => {},
});

export const useFilters = () => useContext(FilterContext);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  // While loading, check if we have a stored token — if so, wait
  const hasToken = !!localStorage.getItem('habit_tracker_token');
  if (isLoading || (!isAuthenticated && hasToken)) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { selectedCategory, setSelectedCategory } = useFilters();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Left Sidebar */}
      <Sidebar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [habitType, setHabitType] = useState<'good' | 'bad'>('good');

  return (
    <FilterContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        habitType,
        setHabitType,
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Landing Page at / */}
          <Route path="/" element={<Landing />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Stats />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Achievements />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Goals />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FilterContext.Provider>
  );
}
