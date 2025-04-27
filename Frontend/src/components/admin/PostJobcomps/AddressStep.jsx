import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AddressStep = ({ input, setInput, prevStep }) => {
  const renderMap = () => {
    const mapOptions = { center: { lat: 40.730610, lng: -73.935242 }, zoom: 12 };
    return (
      <div style={{ height: '300px', width: '100%' }}>
        <GoogleMapReact bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_API_KEY' }} defaultCenter={mapOptions.center} defaultZoom={mapOptions.zoom} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <Label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Street
          </Label>
          <Input
            type="text"
            id="street"
            name="street"
            value={input.street}
            onChange={(e) => setInput({ ...input, street: e.target.value })}
            className="mt-1 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </Label>
          <Input
            type="text"
            id="city"
            name="city"
            value={input.city}
            onChange={(e) => setInput({ ...input, city: e.target.value })}
            className="mt-1 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </Label>
          <Input
            type="text"
            id="state"
            name="state"
            value={input.state}
            onChange={(e) => setInput({ ...input, state: e.target.value })}
            className="mt-1 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </Label>
          <Input
            type="text"
            id="postalCode"
            name="postalCode"
            value={input.postalCode}
            onChange={(e) => setInput({ ...input, postalCode: e.target.value })}
            className="mt-1 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </Label>
          <Input
            type="text"
            id="country"
            name="country"
            value={input.country}
            onChange={(e) => setInput({ ...input, country: e.target.value })}
            className="mt-1 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
          />
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Location Map</h3>
        {renderMap()}
      </div>
    </div>
  );
};

export default AddressStep;