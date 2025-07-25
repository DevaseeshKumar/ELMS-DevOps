import React from 'react';
import { Link } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import bugIcon from '../assets/bug.jpeg';
import gmailIcon from '../assets/gmail.png';
import contactIcon from '../assets/support.png'; // Ensure you have a support icon in your assets

const Help = () => {
  return (
    <>
      <MainNavbar />
      <div className="min-h-screen bg-gradient-to-tr from-gray-100 to-blue-100 py-12 px-4 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Help Center</h1>
        <p className="text-gray-600 mb-10 text-center max-w-xl">
          Need assistance? Choose one of the options below to contact us.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
          {/* Email Inquiry */}
          <Link
            to="/email-support"
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition"
          >
            <img src={gmailIcon} alt="Email Inquiry" className="w-16 h-16 rounded-full mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Inquiry</h2>
            <p className="text-sm text-gray-600 text-center">Submit general questions or feedback via email.</p>
          </Link>

          {/* Bug Report */}
          <Link
            to="/report-bug"
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition"
          >
            <img src={bugIcon} alt="Report Bug" className="w-16 h-16 rounded-full mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Report a Bug</h2>
            <p className="text-sm text-gray-600 text-center">Let us know if something isn't working as expected.</p>
          </Link>

          {/* Support */}
          <Link
            to="/support"
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition"
          >
            <img src={contactIcon} alt="Support" className="w-16 h-16 rounded-full mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Support</h2>
            <p className="text-sm text-gray-600 text-center">Need help? Reach out to our support team.</p>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Help;
