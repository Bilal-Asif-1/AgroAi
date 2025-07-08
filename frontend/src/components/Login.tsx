import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { authAPI } from '../services/api';
import { RootState } from '../store';
import { useLanguage } from '../context/LanguageContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      console.log('Login - Saving token and user data');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Login - Dispatching login success');
      dispatch(loginSuccess(user));
      navigate('/dashboard');
    } catch (error: any) {
      dispatch(loginFailure(error.response?.data?.error || 'An error occurred during login'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side: Logo and Slogan */}
      <div className="md:w-1/2 flex flex-col justify-center items-center bg-gradient-to-br from-green-200 to-green-400 p-8">
        <img src="/Asset 5.png" alt="Agro AI Logo" className="w-50 h-48 mb-6 " />
        <h1 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-4 drop-shadow-lg">AgroAi- Intelligent Solution for real farming</h1>
      </div>
      {/* Right Side: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center bg-[#f6fcf8] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-2xl shadow-2xl p-10 bg-gradient-to-br from-green-100 to-green-200 border border-green-200">
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-center text-3xl font-extrabold text-green-700 mb-2 tracking-wide drop-shadow">
                {t('login.title')}
              </h2>
              <p className="text-center text-green-800 mb-4 font-medium">
                {t('login.subtitle')}
              </p>
            </div>
            {error && <div className="mb-4 text-red-600 text-center text-sm bg-red-100 rounded p-2 border border-red-200">{error}</div>}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-green-900 mb-1">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-500 text-green-900 bg-white placeholder-green-400 shadow-sm"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-green-900 mb-1">
                  {t('login.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-500 text-green-900 bg-white placeholder-green-400 shadow-sm"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition"
                disabled={loading}
              >
                {t('login.button')}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-green-800">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-green-700 font-semibold hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 