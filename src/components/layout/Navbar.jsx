import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Leaf, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Начало' },
  { to: '/hrani', label: 'Каталог на храните' },
  { to: '/trenirovki', label: 'Тренировки' },
  { to: '/recepti', label: 'Споделени Рецепти' },
  { to: '/profil', label: 'Профил' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-100 text-emerald-800'
        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-emerald-800">Здравословен Живот</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <User className="h-4 w-4 text-emerald-600" />
                {user.name}
              </span>
              <button type="button" onClick={logout} className="btn-ghost text-gray-600">
                <LogOut className="h-4 w-4" />
                Изход
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              <LogIn className="h-4 w-4" />
              Вход
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-emerald-50 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Затвори меню' : 'Отвори меню'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-emerald-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 border-t border-emerald-100 pt-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 px-3 text-sm text-gray-600">
                  <User className="h-4 w-4 text-emerald-600" />
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="btn-ghost justify-start text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                  Изход
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary w-full" onClick={() => setMobileOpen(false)}>
                <LogIn className="h-4 w-4" />
                Вход
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
