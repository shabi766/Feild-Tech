import React from 'react';

const Resources = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Resources
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Access helpful tools, guides, and resources to make the most of our platform. 
                            Everything you need to succeed is right here.
                        </p>
                    </div>

                    {/* Resource Categories */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Guides & Tutorials</h3>
                            <p className="text-gray-600 mb-4">Step-by-step guides to help you get started and succeed.</p>
                            <ul className="space-y-2 text-sm">
                                <li>• Getting Started Guide</li>
                                <li>• Profile Optimization Tips</li>
                                <li>• Best Practices for Hiring</li>
                                <li>• Safety Guidelines</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Templates & Forms</h3>
                            <p className="text-gray-600 mb-4">Ready-to-use templates for contracts, invoices, and more.</p>
                            <ul className="space-y-2 text-sm">
                                <li>• Service Agreement Templates</li>
                                <li>• Invoice Templates</li>
                                <li>• Project Brief Templates</li>
                                <li>• Review Templates</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tools & Calculators</h3>
                            <p className="text-gray-600 mb-4">Helpful tools to streamline your work and calculations.</p>
                            <ul className="space-y-2 text-sm">
                                <li>• Pricing Calculator</li>
                                <li>• Time Estimator</li>
                                <li>• ROI Calculator</li>
                                <li>• Project Tracker</li>
                            </ul>
                        </div>
                    </div>

                    {/* Featured Resources */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Featured Resources</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="border-l-4 border-purple-500 pl-6">
                                <h3 className="text-xl font-semibold mb-2">Complete Platform Guide</h3>
                                <p className="text-gray-600 mb-4">Master every feature of our platform with this comprehensive guide.</p>
                                <button className="text-purple-600 font-semibold hover:text-purple-700">
                                    Download Guide →
                                </button>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-6">
                                <h3 className="text-xl font-semibold mb-2">Safety & Compliance</h3>
                                <p className="text-gray-600 mb-4">Essential safety guidelines and compliance requirements for all users.</p>
                                <button className="text-blue-600 font-semibold hover:text-blue-700">
                                    View Guidelines →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Video Tutorials */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Video Tutorials</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="w-full h-32 bg-gray-300 rounded mb-4 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Getting Started</h3>
                                <p className="text-sm text-gray-600">Learn the basics of our platform</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="w-full h-32 bg-gray-300 rounded mb-4 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Profile Optimization</h3>
                                <p className="text-sm text-gray-600">Create a standout profile</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="w-full h-32 bg-gray-300 rounded mb-4 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold mb-2">Advanced Features</h3>
                                <p className="text-sm text-gray-600">Master advanced platform features</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-semibold mb-2">How do I create an account?</h3>
                                <p className="text-gray-600">Click the "Sign Up" button and follow the simple registration process.</p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-semibold mb-2">What services are available?</h3>
                                <p className="text-gray-600">We offer a wide range of technical and home services. Check our service coverage page for details.</p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-semibold mb-2">How do payments work?</h3>
                                <p className="text-gray-600">Payments are processed securely through our platform with multiple payment options available.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Is my information secure?</h3>
                                <p className="text-gray-600">Yes, we use industry-standard security measures to protect all user data and transactions.</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <button className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
                            Explore All Resources
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;
