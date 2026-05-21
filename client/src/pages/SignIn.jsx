import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth.jsx';

function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loading, error } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(signInStart());
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        dispatch(signInFailure(`Server error: ${res.status} ${text}`));
        return;
      }

      const data = await res.json();

      if (!data.success) {
        dispatch(signInFailure(data.message || 'Login failed'));
        return;
      }

      if (data.token) localStorage.setItem('token', data.token);

      const user = data.data ?? data.user ?? data;
      dispatch(signInSuccess(user));

      if (user?.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-3">
      <div className="bg-white shadow-lg rounded-2xl p-7 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-sky-700 mb-7">Sign In</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-sky-300 focus:outline-none shadow-sm transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-sky-300 focus:outline-none shadow-sm transition"
            required
          />

          <button
            disabled={loading}
            className="bg-sky-700 text-white p-3 rounded-xl uppercase hover:bg-sky-800 transition disabled:opacity-70 mt-5"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <div className="flex justify-center mt-1 bg-red-700 text-white p-1 rounded-xl uppercase hover:bg-red-800 transition disabled:opacity-70">
            <OAuth />
          </div>
        </form>

        <div className="flex justify-center gap-2 mt-6 text-sm text-gray-600">
          <p>Don't have an account?</p>
          <Link to="/sign-up" className="text-sky-700 font-semibold hover:underline">Sign Up</Link>
        </div>

        {error && <p className="text-red-500 text-center mt-5 font-medium">{error}</p>}
      </div>
    </div>
  );
}

export default SignIn;
