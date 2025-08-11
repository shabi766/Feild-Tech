import React, { useState } from 'react';

import { Link, useLocation } from 'react-router-dom';



const Sidebar = () => {

  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation(); // ✅ Detect route changes



  const toggleSidebar = () => {

    setIsOpen(!isOpen);

  };



  // ✅ Close sidebar when navigating

  const closeSidebar = () => {

    setIsOpen(false);

  };



  // ✅ Automatically close sidebar when route changes

  React.useEffect(() => {

    closeSidebar();

  }, [location.pathname]);



  return (

    <div className="relative">

      {/* 🔹 Button to toggle sidebar */}
      <div className="fixed top-4 left-0 h-full w-4 hover:w-10 transition-all duration-300 group z-40">
        <button
          onClick={toggleSidebar}
          className="fixed top-1/2 left-2 -translate-y-1/2 bg-indigo-600 text-white p-1 rounded-md z-50
          opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          {isOpen ? '❮' : '❯'}
        </button>
      </div>
      
      {/* 🔹 Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <ul className="space-y-3">
            <li>
              <Link
                to="/chat"
                className="block p-2 rounded-md hover:bg-gray-700 transition"
                onClick={closeSidebar} // ✅ Closes sidebar when clicked
              >
                🗨 Chat
              </Link>
            </li>
            <li>
              <Link
                to="/wallets"
                className="block p-2 rounded-md hover:bg-gray-700 transition"
                onClick={closeSidebar}
              >
                💳 Wallets
              </Link>
            </li>
            <li>
              <Link
                to="/app/dashboard"
                className="block p-2 rounded-md hover:bg-gray-700 transition"
                onClick={closeSidebar} // ✅ Closes sidebar when clicked
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/app/settings"
                className="block p-2 rounded-md hover:bg-gray-700 transition"
                onClick={closeSidebar} // ✅ Closes sidebar when clicked
              >
                ⚙️ Settings
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile"
                className="block p-2 rounded-md hover:bg-gray-700 transition"
                onClick={closeSidebar} // ✅ Closes sidebar when clicked
              >
                👤 Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;