import React from 'react';
import { useSelector } from 'react-redux';
import GeneralNavbar from './GeneralNavbar';
import TechnicianNavbar from './TechnicianNavbar';
import RecruiterNavbar from './RecruiterNavbar';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);

    if (!user) {
        return <GeneralNavbar />;
    }

    switch (user.role) {
        case 'Technician':
            return <TechnicianNavbar user={user} />;
        case 'Recruiter':
            return <RecruiterNavbar user={user} />;
        default:
            return <GeneralNavbar />; // Or handle other roles as needed
    }
};

export default Navbar;