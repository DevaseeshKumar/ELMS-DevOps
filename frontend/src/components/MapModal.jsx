import React from "react";

const MapModal = ({ location, onClose, apiKey }) => {
  if (!location) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="relative w-[90vw] h-[80vh] bg-white rounded shadow-lg overflow-hidden">
        <button
          className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded z-10"
          onClick={onClose}
        >
          Close
        </button>
        <iframe
          title="Employee Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${location.latitude},${location.longitude}&zoom=14`}
        ></iframe>
        
      </div>
    </div>
  );
};

export default MapModal;
