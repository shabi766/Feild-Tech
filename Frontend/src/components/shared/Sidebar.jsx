import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Button to toggle sidebar */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1/2 left-2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-md z-50 transition-all duration-300"
      >
        {isOpen ? '<' : '>'} {/* Change button icon */}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Content */}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
            {/* Add your sidebar items here */}
          </ul>
        </div>
      </div>

      {/* Overlay to prevent interaction with main content when sidebar is open */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-30"
        ></div>
      )}
    </div>
  );
};

export default Sidebar;