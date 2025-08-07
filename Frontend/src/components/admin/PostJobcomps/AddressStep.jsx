import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AddressStep = ({ input, setInput, prevStep }) => {
  const renderMap = () => {
    // You can also use a marker component for better UX
    const mapOptions = { center: { lat: 40.730610, lng: -73.935242 }, zoom: 12 };
    return (
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
        <div style={{ height: '350px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'YOUR_Maps_API_KEY' }}
            defaultCenter={mapOptions.center}
            defaultZoom={mapOptions.zoom}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Job Location</h2>
      <p className="text-gray-500 mb-8">
        Please provide the full address for the job.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          <div>
            <Label htmlFor="street" className="text-sm font-semibold text-gray-700">
              Street Address
            </Label>
            <Input
              type="text"
              id="street"
              name="street"
              value={input.street}
              onChange={(e) => setInput({ ...input, street: e.target.value })}
              className="mt-2 w-full rounded-lg bg-gray-50 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 123 Main Street"
            />
          </div>
          <div>
            <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
              City
            </Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={input.city}
              onChange={(e) => setInput({ ...input, city: e.target.value })}
              className="mt-2 w-full rounded-lg bg-gray-50 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., New York"
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
              State / Province
            </Label>
            <Input
              type="text"
              id="state"
              name="state"
              value={input.state}
              onChange={(e) => setInput({ ...input, state: e.target.value })}
              className="mt-2 w-full rounded-lg bg-gray-50 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., NY"
            />
          </div>
          <div>
            <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700">
              Postal Code
            </Label>
            <Input
              type="text"
              id="postalCode"
              name="postalCode"
              value={input.postalCode}
              onChange={(e) => setInput({ ...input, postalCode: e.target.value })}
              className="mt-2 w-full rounded-lg bg-gray-50 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 10001"
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
              Country
            </Label>
            <Input
              type="text"
              id="country"
              name="country"
              value={input.country}
              onChange={(e) => setInput({ ...input, country: e.target.value })}
              className="mt-2 w-full rounded-lg bg-gray-50 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., United States"
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Location Map</h3>
        {renderMap()}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default AddressStep;