import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { Input } from '@/components/ui/input'; // Assuming you have a Textarea component, we can use Input for a unified look
import { Textarea } from '@/components/ui/textarea'; // Assuming you have a Textarea component

const Contacts = ({ nextStep, prevStep, input, setInput }) => {
  const { user: loggedInUser, loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        Contact Information
      </h2>
      <p className="text-gray-500 mb-8">
        Please provide the contact details for the job manager and other site contacts.
      </p>

      <form className="space-y-8">
        {/* Job Manager Info Section */}
        <div className="space-y-2">
          <Label htmlFor="jobManagerInfo" className="text-sm font-semibold text-gray-700">
            Job Manager
          </Label>
          <div
            id="jobManagerInfo"
            className="flex flex-col gap-1 p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"
          >
            {loggedInUser ? (
              <>
                <div className="font-bold text-gray-800">
                  {loggedInUser.fullname || loggedInUser.name}
                </div>
                <div className="text-sm text-gray-600">
                  {loggedInUser.email}
                </div>
                <div className="text-sm text-gray-600">
                  {loggedInUser.phoneNumber || 'No Phone Number Provided'}
                </div>
              </>
            ) : (
              <div className="text-gray-400 italic">No user logged in</div>
            )}
          </div>
        </div>

        {/* Site Contact Section */}
        <div className="space-y-2">
          <Label htmlFor="siteContact" className="text-sm font-semibold text-gray-700">
            Site Contact
          </Label>
          <Textarea
            id="siteContact"
            name="siteContact"
            value={input.siteContact}
            onChange={handleChange}
            className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter name and contact details for the site contact (e.g., John Doe, +1 555-123-4567)"
            required
          />
        </div>

        {/* Secondary Contact Section */}
        <div className="space-y-2">
          <Label htmlFor="secondaryContact" className="text-sm font-semibold text-gray-700">
            Secondary Contact <span className="text-gray-400 font-normal italic">(Optional)</span>
          </Label>
          <Textarea
            id="secondaryContact"
            name="secondaryContact"
            value={input.secondaryContact} // Corrected name to 'secondaryContact'
            onChange={handleChange}
            className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Optional: Enter name and contact details for a secondary person (e.g., Jane Smith, jane.s@email.com)"
          />
        </div>
      </form>
    </div>
  );
};

export default Contacts;