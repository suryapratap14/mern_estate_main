import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth.jsx';
import API_BASE_URL from '../api.js';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        setLoading(false);
        setError(`Server error: ${res.status} ${text}`);
        return;
      }

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || 'Something went wrong');
        return;
      }

      // if (data.token) localStorage.setItem('token', data.token);

      navigate('/sign-in');
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-3">
      <div className="bg-white shadow-lg rounded-2xl p-7 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-sky-700 mb-7">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-sky-300 focus:outline-none shadow-sm transition"
            required
          />
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

          <div className="flex gap-2 items-center mt-3">
            <label className="font-medium">Role:</label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-sky-300"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="bg-sky-700 text-white p-3 rounded-xl uppercase hover:bg-sky-800 transition disabled:opacity-70 mt-5"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          <div className="flex justify-center mt-1 bg-red-700 text-white p-1 rounded-xl uppercase hover:bg-red-800 transition disabled:opacity-70">
            <OAuth />
          </div>
        </form>

        <div className="flex justify-center gap-2 mt-6 text-sm text-gray-600">
          <p>Have an account?</p>
          <Link to="/sign-in" className="text-sky-700 font-semibold hover:underline">Sign In</Link>
        </div>

        {error && <p className="text-red-500 text-center mt-5 font-medium">{error}</p>}
      </div>
    </div>
  );
}

export default SignUp;
