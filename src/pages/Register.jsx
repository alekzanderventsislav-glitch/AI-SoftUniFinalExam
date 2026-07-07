import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Паролите не съвпадат.');
      return;
    }

    const result = register({ name, email, password });
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Регистрация</h1>
          <p className="mt-1 text-gray-600">Създайте акаунт и започнете здравословния си път</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label-field" htmlFor="name">Име</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder="Вашето име"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="email">Имейл</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="vashe@email.bg"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="password">Парола</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Минимум 6 символа"
                minLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="confirmPassword">Потвърди парола</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Повторете паролата"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            <UserPlus className="h-4 w-4" />
            Регистрирай се
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Вече имате акаунт?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Влезте
          </Link>
        </p>
      </div>
    </div>
  );
}
