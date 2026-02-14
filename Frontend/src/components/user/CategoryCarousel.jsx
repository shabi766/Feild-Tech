import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';
import { motion } from 'framer-motion';
import {
    Flame, Zap, Droplets, Sun, Wifi, HardHat, Wrench, Cpu, Settings, Wind
} from 'lucide-react';

const categories = [
    { name: "HVAC", icon: Flame, color: "from-red-500 to-orange-500", bgLight: "bg-red-50" },
    { name: "Electrical", icon: Zap, color: "from-yellow-500 to-amber-500", bgLight: "bg-yellow-50" },
    { name: "Plumbing", icon: Droplets, color: "from-blue-500 to-cyan-500", bgLight: "bg-blue-50" },
    { name: "Solar", icon: Sun, color: "from-orange-500 to-yellow-400", bgLight: "bg-orange-50" },
    { name: "Network/IT", icon: Wifi, color: "from-indigo-500 to-blue-500", bgLight: "bg-indigo-50" },
    { name: "Construction", icon: HardHat, color: "from-emerald-500 to-green-500", bgLight: "bg-emerald-50" },
    { name: "Maintenance", icon: Wrench, color: "from-gray-500 to-slate-500", bgLight: "bg-gray-100" },
    { name: "Automation", icon: Cpu, color: "from-purple-500 to-violet-500", bgLight: "bg-purple-50" },
    { name: "Mechanical", icon: Settings, color: "from-teal-500 to-cyan-500", bgLight: "bg-teal-50" },
    { name: "Ventilation", icon: Wind, color: "from-sky-500 to-blue-400", bgLight: "bg-sky-50" },
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Browse by <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Category</span>
                    </h2>
                    <p className="text-gray-500 text-base">
                        Explore opportunities across specialized field service trades
                    </p>
                </div>

                {/* Carousel */}
                <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                    <CarouselContent className="-ml-3">
                        {categories.map((cat, index) => (
                            <CarouselItem key={index} className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <motion.button
                                    onClick={() => searchJobHandler(cat.name)}
                                    className="w-full group"
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-blue-200`}>
                                        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${cat.color} shadow-md shadow-black/10 group-hover:shadow-lg transition-all duration-300`}>
                                            <cat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                                            {cat.name}
                                        </span>
                                    </div>
                                </motion.button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex -left-4 bg-white shadow-md border-gray-200 hover:bg-blue-50 hover:border-blue-300" />
                    <CarouselNext className="hidden sm:flex -right-4 bg-white shadow-md border-gray-200 hover:bg-blue-50 hover:border-blue-300" />
                </Carousel>
            </div>
        </div>
    );
};

export default CategoryCarousel;