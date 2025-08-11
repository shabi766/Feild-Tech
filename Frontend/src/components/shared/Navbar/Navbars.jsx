import React from 'react';
import { useSelector } from 'react-redux';
import GeneralNavbar from './GeneralNavbar';
import TechnicianNavbar from './TechnicianNavbar';
import RecruiterNavbar from './RecruiterNavbar';
import AdministratorNavbar from './AdministratorNavbar';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);

    console.log('Navbar - Current user:', user);
    console.log('Navbar - User role:', user?.role);

    if (!user) {
        console.log('Navbar - No user, returning GeneralNavbar');
        return <GeneralNavbar />;
    }

    console.log('Navbar - User role switch:', user.role);
    switch (user.role) {
        case 'Technician':
            console.log('Navbar - Returning TechnicianNavbar');
            return <TechnicianNavbar user={user} />;
        case 'Recruiter':
            console.log('Navbar - Returning RecruiterNavbar');
            return <RecruiterNavbar user={user} />;
        case 'Admin':
            console.log('Navbar - Returning AdministratorNavbar');
            return <AdministratorNavbar user={user} />;
        default:
            console.log('Navbar - No matching role, returning GeneralNavbar');
            return <GeneralNavbar />; // Or handle other roles as needed
    }
};

export default Navbar;