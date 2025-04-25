import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';

const Contacts = ({ nextStep, prevStep, input, setInput }) => { // Receive input and setInput
  const { user: loggedInUser, loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value }); // Update local input state
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <form className="space-y-4">
     

      <div>
        <Label htmlFor="jobManagerInfo" className="block text-sm font-medium text-gray-700">
          Job Manager
        </Label>
        <div
          id="jobManagerInfo"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
        >
          {loggedInUser ? (
            <>
              <div>{loggedInUser.fullname || loggedInUser.name}</div>
              <div>{loggedInUser.email}</div>
              <div>{loggedInUser.phoneNumber || 'No Phone Number'}</div>
            </>
          ) : (
            'No user logged in'
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="siteContact" className="block text-sm font-medium text-gray-700">
          Site Contact
        </Label>
        <textarea
          id="siteContact"
          name="siteContact"
          value={input.siteContact} // Use input.siteContact
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
          rows={3}
          placeholder="Enter name and contact details for the site contact"
          required
        />
      </div>

      <div>
        <Label htmlFor="secondaryContact" className="block text-sm font-medium text-gray-700">
          Secondary Contact <span className="text-gray-500">(Optional)</span>
        </Label>
        <textarea
          id="secondaryContact"
          name="SecondaryContact"
          value={input.SecondaryContact} // Use input.SecondaryContact
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
          rows={3}
          placeholder="Optional: Enter name and contact details for a secondary person"
        />
      </div>

     
    </form>
  );
};

export default Contacts;