import React from 'react';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            About Us
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We're revolutionizing how people connect with skilled technicians and professionals. 
                            Our mission is to make quality services accessible to everyone.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white rounded-lg p-8 shadow-lg">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-4">Our Mission</h2>
                            <p className="text-gray-600 text-center">
                                To bridge the gap between skilled professionals and those who need their expertise, 
                                creating opportunities for growth and success for everyone involved.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-8 shadow-lg">
                            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-4">Our Vision</h2>
                            <p className="text-gray-600 text-center">
                                To become the leading platform that empowers professionals and connects communities 
                                through reliable, efficient, and trusted service delivery.
                            </p>
                        </div>
                    </div>

                    {/* Company Story */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-600 mb-6">
                                Founded with a simple yet powerful idea, we recognized that finding reliable, 
                                skilled technicians was often a frustrating and time-consuming process. At the same time, 
                                talented professionals struggled to connect with potential clients and grow their businesses.
                            </p>
                            <p className="text-gray-600 mb-6">
                                Our platform was born from the belief that technology could solve this problem by creating 
                                a seamless, transparent, and efficient marketplace where quality meets opportunity. 
                                We've built a community where trust, professionalism, and excellence are the foundation 
                                of every interaction.
                            </p>
                            <p className="text-gray-600">
                                Today, we're proud to serve thousands of professionals and clients across multiple regions, 
                                helping them achieve their goals and build lasting relationships.
                            </p>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Trust</h3>
                                <p className="text-sm text-gray-600">Building reliable relationships through transparency and honesty.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Innovation</h3>
                                <p className="text-sm text-gray-600">Continuously improving our platform and services.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Community</h3>
                                <p className="text-sm text-gray-600">Fostering connections and supporting growth.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Excellence</h3>
                                <p className="text-sm text-gray-600">Delivering the highest quality service and experience.</p>
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
                        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                            We're a diverse team of professionals passionate about technology, service, and community. 
                            Our expertise spans across various fields, united by our commitment to excellence.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                                <h3 className="font-semibold mb-1">Leadership Team</h3>
                                <p className="text-sm text-gray-600">Experienced professionals guiding our vision</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                                <h3 className="font-semibold mb-1">Technology Team</h3>
                                <p className="text-sm text-gray-600">Building innovative solutions for our platform</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                                <h3 className="font-semibold mb-1">Support Team</h3>
                                <p className="text-sm text-gray-600">Ensuring exceptional customer experience</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">By The Numbers</h2>
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-teal-600 mb-2">10K+</div>
                                <p className="text-gray-600">Happy Clients</p>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-teal-600 mb-2">5K+</div>
                                <p className="text-gray-600">Skilled Technicians</p>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-teal-600 mb-2">50+</div>
                                <p className="text-gray-600">Cities Served</p>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-teal-600 mb-2">99%</div>
                                <p className="text-gray-600">Satisfaction Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <button className="bg-teal-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors">
                            Join Our Community
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
