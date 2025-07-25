// components/Avatar.jsx
import React from "react";

const getRandomColor = (seed) => {
  const colors = ["#f87171", "#facc15", "#34d399", "#60a5fa", "#c084fc", "#f472b6"];
  let index = seed.charCodeAt(0) % colors.length;
  return colors[index];
};

const Avatar = ({ username = "", imageUrl, size = 80 }) => {
  const letter = username ? username.charAt(0).toUpperCase() : "?";
  const bgColor = getRandomColor(letter);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Profile"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold"
      style={{ backgroundColor: bgColor, width: size, height: size }}
    >
      {letter}
    </div>
  );
};

export default Avatar;
