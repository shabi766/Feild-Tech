import React from 'react';
import { Link } from 'react-router-dom';
import NavbarBase from './NavbarBase';

const GeneralNavbar = () => {
    return (
        <NavbarBase>
            <div className='flex items-center gap-4'>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/jobs">Jobs</Link></li>
                <li><Link to="/browse">Browse</Link></li>
            </div>
        </NavbarBase>
    );
};

export default GeneralNavbar;