import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Facebook, Instagram, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Sidebar() {
  const { signOut } = useAuth();

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-8">
        <BarChart2 className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold">SMM Dashboard</h1>
      </div>
      
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800 text-blue-400' : ''
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Vue d'ensemble</span>
        </NavLink>
        
        <NavLink
          to="/facebook"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800 text-blue-400' : ''
            }`
          }
        >
          <Facebook className="w-5 h-5" />
          <span>Facebook</span>
        </NavLink>
        
        <NavLink
          to="/instagram"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800 text-blue-400' : ''
            }`
          }
        >
          <Instagram className="w-5 h-5" />
          <span>Instagram</span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${
              isActive ? 'bg-gray-800 text-blue-400' : ''
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </NavLink>
      </nav>
      
      <button
        onClick={signOut}
        className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors mt-auto absolute bottom-4 left-4"
      >
        <LogOut className="w-5 h-5" />
        <span>Déconnexion</span>
      </button>
    </div>
  );
}