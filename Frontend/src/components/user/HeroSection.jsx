import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <div className='text-center'>
            <div className='flex flex-col gap-5 my-10'>
                <span className='mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#f83003] font-medium'>
                    Job Hunt Website
                </span>
                <h1 className='text-5xl font-bold'>
                    Search, Apply & <br /> Show your <span className='text-[#6A38C2]'>Skills</span>
                </h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt illum itaque veniam? Consequuntur quaerat nisi animi ex repudiandae, alias, at labore assumenda deleniti accusantium, minima doloremque dolor sint earum cupiditate.</p>
            </div>
            <div className='flex w-[40%] shadow-lg border border-gray-400 pl-3 rounded-full items-center gap-4 mx-auto'>
                <input
                    type="text"
                    placeholder='Find your field'
                    onChange={(e) => setQuery(e.target.value)} // Corrected onChange typo
                    className='outline-none border-none w-full'
                    aria-label="Job search input" // Added aria-label for accessibility
                />
                <Button onClick={searchJobHandler} className="rounded-r-full bg-[#38c24f]">
                    <Search className='h-5 w-5' aria-label="Search icon" />
                </Button>
            </div>
        </div>
    );
};

export default HeroSection;
