import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../api'; // Import the URL

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  // 1. Get token from storage
  const token = localStorage.getItem('authToken');

  // Separate state for the file
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    phone: '',
    email: ''
    // removed photoUrl from here, we use 'file' state instead
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const res = await axios.get(`${BASE_URL}/api/members`);
    // ... inside handleSubmit ...
    setMembers(res.data);
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Save the file object
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Create FormData object
    const data = new FormData();
    data.append('name', formData.name);
    data.append('domain', formData.domain);
    data.append('phone', formData.phone);
    data.append('email', formData.email);

    // 2. Append the file if it exists
    if (file) {
      data.append('photo', file);
    }

    try {
      await axios.post(`${BASE_URL}/api/members`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'auth-token': token // ATTACH TOKEN HERE
        }
      });

      alert("Member Added Successfully!");
      fetchMembers();

      // Reset Form
      setFormData({ name: '', domain: '', phone: '', email: '' });
      setFile(null);

      // Reset file input visually
      document.getElementById('fileInput').value = "";

    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to add member");
    }
  };

  // 3. Protect the DELETE Request
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/members/${id}`, {
        headers: { 'auth-token': token } // ATTACH TOKEN HERE
      });
      fetchMembers();
    } catch (err) {
      alert("Access Denied.");
    }
  };
  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-5">Admin Panel</h2>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-10 grid gap-4 bg-gray-100 p-5 rounded shadow">
        <div className="grid grid-cols-2 gap-4">
          <input className="p-2 border rounded" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <input className="p-2 border rounded" placeholder="Domain" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} required />
          <input className="p-2 border rounded" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          <input className="p-2 border rounded" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>

        {/* File Input */}
        <div className="bg-white p-3 border rounded">
          <label className="block text-sm font-bold mb-2">Profile Photo</label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition">
          + Add Member & Upload ID
        </button>
      </form>

      {/* Members List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Photo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Domain</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member._id} className="border-b bg-white">
                <td className="p-3">
                  <img
                    src={member.photoUrl}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="p-3">{member.name}</td>
                <td className="p-3">{member.domain}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(member._id)} className="text-red-500 font-bold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
