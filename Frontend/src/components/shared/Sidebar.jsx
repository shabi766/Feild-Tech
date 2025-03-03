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

      <button

        onClick={toggleSidebar}

        className="fixed top-1/2 left-2 -translate-y-1/2 bg-indigo-600 text-white p-1 rounded-md z-50 transition-all duration-300"

      >

        {isOpen ? '❮' : '❯'}

      </button>



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

                to="/dashboard"

                className="block p-2 rounded-md hover:bg-gray-700 transition"

                onClick={closeSidebar} // ✅ Closes sidebar when clicked

              >

                📊 Dashboard

              </Link>

            </li>

          </ul>

        </div>

      </div>



      {/* 🔹 Overlay to close sidebar when clicking outside */}

      {isOpen && (

        <div

          onClick={closeSidebar}

          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-30"

        ></div>

      )}

    </div>

  );

};



export default Sidebar;