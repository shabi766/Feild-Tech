import React from 'react';
import { useSelector } from 'react-redux';
import GeneralNavbar from './GeneralNavbar';
import TechnicianNavbar from './TechnicianNavbar';
import RecruiterNavbar from './RecruiterNavbar';
import IndividualRecruiterNavbar from './IndividualRecruiterNavbar';
import AdministratorNavbar from './AdministratorNavbar';

const Navbar = ({ setLogoutFlag }) => {
    const { user } = useSelector(store => store.auth);

    if (!user) {
        return <GeneralNavbar setLogoutFlag={setLogoutFlag} />;
    }

    // Normalize role to lowercase for case-insensitive comparison
    const normalizedRole = user.role?.toLowerCase().trim();

    switch (normalizedRole) {
        case 'technician':
            return <TechnicianNavbar user={user} setLogoutFlag={setLogoutFlag} />;
        case 'company':
            return <RecruiterNavbar user={user} setLogoutFlag={setLogoutFlag} />;
        case 'recruiter':
            if (user.recruiterType === 'Company') {
                return <RecruiterNavbar user={user} setLogoutFlag={setLogoutFlag} />;
            } else {
                return <IndividualRecruiterNavbar user={user} setLogoutFlag={setLogoutFlag} />;
            }
        case 'admin':
            return <AdministratorNavbar user={user} setLogoutFlag={setLogoutFlag} />;
        default:
            return <GeneralNavbar setLogoutFlag={setLogoutFlag} />;
    }
};

export default Navbar;