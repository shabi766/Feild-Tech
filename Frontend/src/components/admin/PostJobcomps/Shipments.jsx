import React, { useState, useCallback, useEffect } from 'react'; // Import useEffect
import styles from './PostJobs.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ShipmentItem = ({ shipment, index, onShipmentChange, onRemoveShipment }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onShipmentChange(index, { ...shipment, [name]: value });
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        onShipmentChange(index, { ...shipment, picture: file });
    };

    return (
        <div className={styles.shipmentItem}>
            <h4 className={styles.shipmentItemTitle}>Shipment #{index + 1}</h4>
            <div className={styles.formGroup}>
                <label htmlFor={`shipmentNumber-${index}`}>Shipment Number</label>
                <Input
                    type="text"
                    id={`shipmentNumber-${index}`}
                    name="shipmentNumber"
                    value={shipment.shipmentNumber || ''}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor={`status-${index}`}>Status</label>
                <Input
                    type="text"
                    id={`status-${index}`}
                    name="status"
                    value={shipment.status || ''}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor={`picture-${index}`}>Picture</label>
                <Input
                    type="file"
                    id={`picture-${index}`}
                    name="picture"
                    onChange={handlePictureChange}
                />
                {shipment.picture instanceof File && (
                    <p className={styles.fileName}>Selected File: {shipment.picture.name}</p>
                )}
                {typeof shipment.picture === 'string' && shipment.picture && (
                    <img src={shipment.picture} alt="Shipment" className={styles.uploadedImage} style={{maxWidth: '100px', maxHeight: '100px'}} />
                )}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor={`trackingId-${index}`}>Tracking ID</label>
                <Input
                    type="text"
                    id={`trackingId-${index}`}
                    name="trackingId"
                    value={shipment.trackingId || ''}
                    onChange={handleInputChange}
                />
            </div>
            <Button onClick={() => onRemoveShipment(index)} className="bg-red-500 text-white py-2 px-4 rounded-md mt-2">
                Remove Shipment
            </Button>
        </div>
    );
};

const Shipments = ({ onShipmentsChange, initialShipments = [] }) => {
    const [shipments, setShipments] = useState(initialShipments);

    useEffect(() => { // useEffect is now correctly imported and should work
        onShipmentsChange(shipments);
    }, [shipments, onShipmentsChange]);

    const handleShipmentChange = useCallback((index, newShipment) => {
        const updatedShipments = [...shipments];
        updatedShipments[index] = newShipment;
        setShipments(updatedShipments);
    }, [shipments]);

    const handleAddShipment = useCallback(() => {
        setShipments([...shipments, {}]);
    }, [shipments]);

    const handleRemoveShipment = useCallback((indexToRemove) => {
        setShipments(shipments.filter((_, index) => index !== indexToRemove));
    }, [shipments]);

    return (
        <div>
            {shipments.map((shipment, index) => (
                <ShipmentItem
                    key={index}
                    shipment={shipment}
                    index={index}
                    onShipmentChange={handleShipmentChange}
                    onRemoveShipment={handleRemoveShipment}
                />
            ))}
            <Button onClick={handleAddShipment} className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4">
                Add Shipment
            </Button>
        </div>
    );
};

export default Shipments;