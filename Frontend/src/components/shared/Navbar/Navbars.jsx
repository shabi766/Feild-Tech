import React from 'react';
import { useSelector } from 'react-redux';
import GeneralNavbar from './GeneralNavbar';
import TechnicianNavbar from './TechnicianNavbar';
import RecruiterNavbar from './RecruiterNavbar';
import IndividualRecruiterNavbar from './IndividualRecruiterNavbar';
import AdministratorNavbar from './AdministratorNavbar';

const Navbar = ({ setLogoutFlag }) => {
    const { user } = useSelector(store => store.auth);

    console.log('Navbar - Current user:', user);
    console.log('Navbar - User role:', user?.role);

    if (!user) {
        console.log('Navbar - No user, returning GeneralNavbar');
        return <GeneralNavbar setLogoutFlag={setLogoutFlag} />;
    }

    console.log('Navbar - User role switch:', user.role);
    switch (user.role) {
        case 'Technician':
            console.log('Navbar - Returning TechnicianNavbar');
            return <TechnicianNavbar user={user} setLogoutFlag={setLogoutFlag} />;
        case 'Recruiter':
            // Check if this is an individual recruiter or company recruiter
            if (user.recruiterType === 'Company') {
                console.log('Navbar - Returning RecruiterNavbar (Company)');
                return <RecruiterNavbar user={user} setLogoutFlag={setLogoutFlag} />;
            } else {
                console.log('Navbar - Returning IndividualRecruiterNavbar');
                return <IndividualRecruiterNavbar user={user} setLogoutFlag={setLogoutFlag} />;
            }
        case 'Admin':
            console.log('Navbar - Returning AdministratorNavbar');
            return <AdministratorNavbar user={user} setLogoutFlag={setLogoutFlag} />;
        default:
            console.log('Navbar - No matching role, returning GeneralNavbar');
            return <GeneralNavbar setLogoutFlag={setLogoutFlag} />; // Or handle other roles as needed
    }
};

export default Navbar;