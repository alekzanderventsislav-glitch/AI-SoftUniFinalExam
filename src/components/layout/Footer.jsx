import { Link } from 'react-router-dom';
import { Leaf, Heart, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-bold text-emerald-800">Здравословен Живот</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Вашият портал за здравословно хранене, фитнес и балансиран начин на живот.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Бързи връзки</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="text-gray-600 hover:text-emerald-600">Начало</Link></li>
              <li><Link to="/hrani" className="text-gray-600 hover:text-emerald-600">Каталог на храните</Link></li>
              <li><Link to="/trenirovki" className="text-gray-600 hover:text-emerald-600">Тренировки</Link></li>
              <li><Link to="/recepti" className="text-gray-600 hover:text-emerald-600">Споделени Рецепти</Link></li>
              <li><Link to="/profil" className="text-gray-600 hover:text-emerald-600">Профил</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Контакт</h3>
            <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-emerald-600" />
              info@zdravosloven-zhivot.bg
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Heart className="h-4 w-4 text-emerald-600" />
              Направено с грижа за вашето здраве
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-emerald-100 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Здравословен Живот. Всички права запазени.
        </div>
      </div>
    </footer>
  );
}
