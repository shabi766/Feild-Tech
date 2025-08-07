import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Label is now imported for consistency

const ShipmentItem = ({ shipment, index, onShipmentChange, onRemoveShipment }) => {
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        onShipmentChange(index, { ...shipment, [name]: value });
    }, [index, shipment, onShipmentChange]);

    const handlePictureChange = useCallback((e) => {
        const file = e.target.files[0];
        onShipmentChange(index, { ...shipment, picture: file });
    }, [index, shipment, onShipmentChange]);

    const displayImageUrl = shipment.picture instanceof File 
        ? URL.createObjectURL(shipment.picture) 
        : typeof shipment.picture === 'string' && shipment.picture 
        ? shipment.picture 
        : null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
                <h4 className="text-xl font-bold text-gray-800">Shipment #{index + 1}</h4>
                <Button 
                    onClick={() => onRemoveShipment(index)} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    Remove
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipment Number */}
                <div className="space-y-2">
                    <Label htmlFor={`shipmentNumber-${index}`}>Shipment Number</Label>
                    <Input
                        type="text"
                        id={`shipmentNumber-${index}`}
                        name="shipmentNumber"
                        value={shipment.shipmentNumber || ''}
                        onChange={handleInputChange}
                        placeholder="Enter shipment number"
                    />
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor={`status-${index}`}>Status</Label>
                    <Input
                        type="text"
                        id={`status-${index}`}
                        name="status"
                        value={shipment.status || ''}
                        onChange={handleInputChange}
                        placeholder="Enter status"
                    />
                </div>

                {/* Tracking ID */}
                <div className="space-y-2">
                    <Label htmlFor={`trackingId-${index}`}>Tracking ID</Label>
                    <Input
                        type="text"
                        id={`trackingId-${index}`}
                        name="trackingId"
                        value={shipment.trackingId || ''}
                        onChange={handleInputChange}
                        placeholder="Enter tracking ID"
                    />
                </div>

                {/* Picture Upload */}
                <div className="space-y-2">
                    <Label htmlFor={`picture-${index}`}>Picture</Label>
                    <Input
                        type="file"
                        id={`picture-${index}`}
                        name="picture"
                        onChange={handlePictureChange}
                        className="file:bg-blue-500 file:text-white file:border-0 file:rounded-md file:cursor-pointer"
                    />
                    {displayImageUrl && (
                        <div className="mt-2">
                            <img src={displayImageUrl} alt="Shipment" className="w-24 h-24 object-cover rounded-md border" />
                        </div>
                    )}
                    {shipment.picture instanceof File && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                            Selected: {shipment.picture.name}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ShipmentItem;