import React from 'react';

const FindWork = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Find Work
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Discover exciting job opportunities that match your skills and expertise. 
                            Connect with clients and grow your career with our platform.
                        </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Flexible Opportunities</h3>
                            <p className="text-gray-600">Choose from full-time, part-time, or project-based work that fits your schedule.</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Competitive Pay</h3>
                            <p className="text-gray-600">Earn what you're worth with transparent pricing and fair compensation.</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
                            <p className="text-gray-600">Connect with clients and other professionals to expand your opportunities.</p>
                        </div>
                    </div>

                    {/* Job Categories */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Popular Job Categories</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">IT & Software</h3>
                                <p className="text-sm text-gray-600">Development, Support, Consulting</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Electronics</h3>
                                <p className="text-sm text-gray-600">Repair, Installation, Maintenance</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">HVAC</h3>
                                <p className="text-sm text-gray-600">Installation, Repair, Service</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-2">Plumbing</h3>
                                <p className="text-sm text-gray-600">Installation, Repair, Maintenance</p>
                            </div>
                        </div>
                    </div>

                    {/* Success Steps */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Steps to Success</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
                                <p className="text-gray-600">Build a compelling profile showcasing your skills and experience.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Browse Jobs</h3>
                                <p className="text-gray-600">Search and apply for jobs that match your expertise and preferences.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Get Hired</h3>
                                <p className="text-gray-600">Connect with clients, complete projects, and build your reputation.</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <button className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors">
                            Start Finding Work
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindWork;
