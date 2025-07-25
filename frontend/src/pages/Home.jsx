import React from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import heroImage from "../assets/Elms.png"; // Add your own image to /assets and update the path

const Home = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/about");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-white">
      <MainNavbar />

      <main className="flex-grow flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-12">
        {/* Left content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight mb-4">
            Simplify Your <span className="text-blue-600">Leave</span> Workflow!
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            ELMS helps your organization efficiently manage leave requests, approvals, and tracking — all in one place.
          </p>
          <button
            onClick={handleExplore}
            className="bg-red-500 hover:bg-red-600 transition text-white px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            Explore Now →
          </button>
        </div>

        {/* Right image */}
        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
  <img
    src={heroImage}
    alt="Hero ELMS"
    className="w-64 md:w-80 drop-shadow-xl rounded-lg"
  />
</div>
      </main>

      <Footer />
      {/* Help Button */}
<button
  onClick={() => navigate("/help")}
  className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-md z-50"
>
  Help ?
</button>

    </div>
  );
};

export default Home;
