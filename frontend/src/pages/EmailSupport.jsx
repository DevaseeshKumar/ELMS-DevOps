import React, { useState } from 'react';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import axios from 'axios';
import gmailIcon from '../assets/gmail.png';


const EmailInquiry = () => {
  const [form, setForm] = useState({ name: '', email: '', inquiry: '' });
  const [status, setStatus] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/contact/inquiry', {
  name: form.name,
  email: form.email,
  message: form.inquiry, // ✅ rename field to match backend
});
      setStatus('Inquiry sent successfully!');
      setForm({ name: '', email: '', inquiry: '' });
    } catch (err) {
      setStatus('Failed to send inquiry.');
    }
  };

  return (
    <>
      <MainNavbar />
      <div className="flex flex-col items-center py-10 px-4 bg-gradient-to-br from-pink-100 to-yellow-100 min-h-screen">
        <img
  src={gmailIcon}
  alt="Gmail Icon"
  className="w-16 h-16 rounded-full mb-4"
  onError={(e) => e.target.style.display = 'none'}
/>


        <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Inquiry</h1>
        <p className="mb-6 text-gray-600 text-center">Submit your email-based questions here.</p>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name"
            className="mb-4 w-full px-3 py-2 border rounded" required />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your Email"
            className="mb-4 w-full px-3 py-2 border rounded" required />
          <textarea name="inquiry" value={form.inquiry} onChange={handleChange} placeholder="Your Inquiry"
            className="mb-4 w-full px-3 py-2 border rounded" rows="4" required />
          <button
  type="submit"
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 w-full"
>
  Submit Inquiry
</button>

          {status && <p className="text-center text-sm mt-4">{status}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EmailInquiry;
