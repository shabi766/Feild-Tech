import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ShipmentItem from './ShipmentItem'

const Shipments = ({ onShipmentsChange, initialShipments = [] }) => {
    const [shipments, setShipments] = useState(initialShipments);

    useEffect(() => {
        if (typeof onShipmentsChange === 'function') {
            onShipmentsChange(shipments);
        }
    }, [shipments, onShipmentsChange]);

    const handleShipmentChange = useCallback((index, newShipment) => {
        const updatedShipments = [...shipments];
        updatedShipments[index] = newShipment;
        setShipments(updatedShipments);
    }, [shipments]);

    const handleAddShipment = useCallback(() => {
        setShipments([...shipments, { shipmentNumber: '', status: '', trackingId: '', picture: null }]);
    }, [shipments]);

    const handleRemoveShipment = useCallback((indexToRemove) => {
        setShipments(shipments.filter((_, index) => index !== indexToRemove));
    }, [shipments]);

    return (
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 border-b pb-4">
                Shipment Details
            </h2>
            <p className="text-gray-500">
                Add and manage individual shipment items for this job. You can add as many as needed.
            </p>

            <div className="space-y-6">
                {shipments.map((shipment, index) => (
                    <ShipmentItem
                        key={index}
                        shipment={shipment}
                        index={index}
                        onShipmentChange={handleShipmentChange}
                        onRemoveShipment={handleRemoveShipment}
                    />
                ))}
            </div>

            <Button 
                onClick={handleAddShipment} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
                Add Shipment
            </Button>
        </div>
    );
};

export default Shipments;