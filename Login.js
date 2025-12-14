import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api'; // Import the URL

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/login`, { username, password });
      
     // SAVE THE TOKEN to LocalStorage
      localStorage.setItem('authToken', res.data.token);
      
      alert("Login Success!");
      navigate('/admin'); // Go to Dashboard
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input 
          className="w-full p-2 border mb-4" 
          placeholder="Username" 
          onChange={e => setUsername(e.target.value)} 
        />
        <input 
          className="w-full p-2 border mb-4" 
          type="password" 
          placeholder="Password" 
          onChange={e => setPassword(e.target.value)} 
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;
