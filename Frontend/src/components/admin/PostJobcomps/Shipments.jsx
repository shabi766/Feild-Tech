import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';

const ShipmentItem = ({ shipment, onAddPicture }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // In a real application, you would upload this to S3 here.
      console.log(`Simulating upload of ${selectedFile.name} for Shipment ID: ${shipment.shipmentId}`);
      onAddPicture(shipment.shipmentId, selectedFile);
      setSelectedFile(null); // Reset after "upload"
    } else {
      alert('Please select a picture to upload.');
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-md shadow-sm">
      <h4 className="font-semibold text-lg mb-2">Shipment ID: {shipment.shipmentId}</h4>
      <div className="mb-2">
        <Label className="block text-sm font-medium text-gray-700">Shipment Status</Label>
        <div className="mt-1 text-sm text-gray-500">{shipment.status}</div>
      </div>
      <div>
        <Label htmlFor={`picture-${shipment.shipmentId}`} className="block text-sm font-medium text-gray-700">
          Add Picture
        </Label>
        <div className="mt-1 flex items-center space-x-2">
          <Input
            type="file"
            id={`picture-${shipment.shipmentId}`}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Label htmlFor={`picture-${shipment.shipmentId}`} className="cursor-pointer rounded-md border text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 px-3 py-2">
            Select File
          </Label>
          {selectedFile && <span className="text-sm text-gray-500">{selectedFile.name}</span>}
          <Button size="sm" onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </div>
      </div>
      {shipment.pictures && shipment.pictures.length > 0 && (
        <div className="mt-4">
          <Label className="block text-sm font-medium text-gray-700">Pictures</Label>
          <div className="mt-1 flex space-x-2">
            {shipment.pictures.map((picture, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border">
                {/* In a real app, you'd display the image from S3 URL here */}
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  Image {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Shipments = () => {
  const [shipments, setShipments] = useState([
    { shipmentId: 'SHP001', status: 'On the way', pictures: [] },
    { shipmentId: 'SHP002', status: 'Delivered', pictures: ['s3://example/shp002-1.jpg'] },
  ]);
  const [newShipmentId, setNewShipmentId] = useState('');
  const [newShipmentStatus, setNewShipmentStatus] = useState('on the way');

  const handleAddShipment = () => {
    if (newShipmentId) {
      setShipments([...shipments, { shipmentId: newShipmentId, status: newShipmentStatus, pictures: [] }]);
      setNewShipmentId('');
    } else {
      alert('Please enter a Shipment ID.');
    }
  };

  const handleAddPictureToShipment = (shipmentId, file) => {
    setShipments(
      shipments.map((shipment) =>
        shipment.shipmentId === shipmentId ? { ...shipment, pictures: [...shipment.pictures, file.name] } : shipment
      )
    );
    console.log(`Picture added for Shipment ID: ${shipmentId}`, file);
    // In a real scenario, you would update the backend/database with the S3 link.
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Shipment Information</h2>

      {shipments.map((shipment) => (
        <ShipmentItem key={shipment.shipmentId} shipment={shipment} onAddPicture={handleAddPictureToShipment} />
      ))}

      <div className="mt-8 p-4 border rounded-md shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Add New Shipment</h3>
        <div className="mb-2">
          <Label htmlFor="newShipmentId" className="block text-sm font-medium text-gray-700">
            Shipment ID
          </Label>
          <Input
            type="text"
            id="newShipmentId"
            value={newShipmentId}
            onChange={(e) => setNewShipmentId(e.target.value)}
            className="mt-1 w-full sm:w-64"
          />
        </div>
        <div className="mb-2">
          <Label htmlFor="newShipmentStatus" className="block text-sm font-medium text-gray-700">
            Shipment Status
          </Label>
          <Select value={newShipmentStatus} onValueChange={(value) => setNewShipmentStatus(value)}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on the way">On the way</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddShipment}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Shipment
        </Button>
      </div>
    </div>
  );
};

export default Shipments;