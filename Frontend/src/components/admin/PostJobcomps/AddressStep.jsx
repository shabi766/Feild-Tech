import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AddressStep = ({ input, setInput, prevStep }) => {
    const renderMap = () => {
        const mapOptions = { center: { lat: 40.730610, lng: -73.935242, }, zoom: 12, };
        return (
            <div style={{ height: '300px', width: '100%' }}>
                <GoogleMapReact bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_API_KEY' }} defaultCenter={mapOptions.center} defaultZoom={mapOptions.zoom} />
            </div>
        );
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Address</h2>
            <div><Label>Street</Label><Input type="text" name="street" value={input.street} onChange={(e) => setInput({ ...input, street: e.target.value })} className="my-2" /></div>
            <div><Label>City</Label><Input type="text" name="city" value={input.city} onChange={(e) => setInput({ ...input, city: e.target.value })} className="my-2" /></div>
            <div><Label>State</Label><Input type="text" name="state" value={input.state} onChange={(e) => setInput({ ...input, state: e.target.value })} className="my-2" /></div>
            <div><Label>Postal Code</Label><Input type="text" name="postalCode" value={input.postalCode} onChange={(e) => setInput({ ...input, postalCode: e.target.value })} className="my-2" /></div>
            <div><Label>Country</Label><Input type="text" name="country" value={input.country} onChange={(e) => setInput({ ...input, country: e.target.value })} className="my-2" /></div>
            <div className="mt-6"><h3 className="font-semibold text-lg mb-2">Location Map</h3>{renderMap()}</div>
           
        </div>
    );
};

export default AddressStep;