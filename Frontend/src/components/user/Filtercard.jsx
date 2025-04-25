import React, { useEffect, useState } from 'react';
import Select from 'react-select'; // Searchable select component
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';

const filterData = [
    {
        filterType: "Location",
        array: ["Islamabad", "Punjab", "Sindh", "Balochistan", "KPK", "Federal"]
    },
    {
        filterType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"]
    },
    {
        filterType: "Salary",
        array: ["0-40k", "42-1lakh", "1lakh to 5lakh"]
    },
];

const FilterCard = () => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const dispatch = useDispatch();

    // Dispatch selected query based on filter values
    useEffect(() => {
        const filters = {
            location: selectedLocation,
            industry: selectedIndustry,
            salary: selectedSalary,
        };
        dispatch(setSearchedQuery(filters)); // Send filters to Redux
    }, [selectedLocation, selectedIndustry, selectedSalary, dispatch]);

    return (
        <div className='w-full bg-white p-3 rounded-md'>
            <h1 className='font-bold text-lg mb-4'>Filter Jobs</h1>
            
            {/* Location Filter */}
            <div className='mb-4'>
                <h1 className='font-bold text-lg mb-2'>Location</h1>
                <Select
                    options={filterData[0].array.map(location => ({ value: location, label: location }))}
                    onChange={(option) => setSelectedLocation(option?.value || null)}
                    placeholder="Select Location"
                    isClearable
                    isSearchable
                />
            </div>

            {/* Industry Filter */}
            <div className='mb-4'>
                <h1 className='font-bold text-lg mb-2'>Industry</h1>
                <Select
                    options={filterData[1].array.map(industry => ({ value: industry, label: industry }))}
                    onChange={(option) => setSelectedIndustry(option?.value || null)}
                    placeholder="Select Industry"
                    isClearable
                    isSearchable
                />
            </div>

            {/* Salary Filter */}
            <div className='mb-4'>
                <h1 className='font-bold text-lg mb-2'>Salary</h1>
                <Select
                    options={filterData[2].array.map(salary => ({ value: salary, label: salary }))}
                    onChange={(option) => setSelectedSalary(option?.value || null)}
                    placeholder="Select Salary Range"
                    isClearable
                />
            </div>
        </div>
    );
};

export default FilterCard;
