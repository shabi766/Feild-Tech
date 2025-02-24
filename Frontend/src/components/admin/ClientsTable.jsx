import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Footer from '../shared/Footer';

const ClientsTable = () => {
    const { clients = [], searchClientByText } = useSelector(store => store.client || {});
    const [filterClient, setFilterClient] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const filteredClient = clients.filter((client) => {
            if (!searchClientByText) return true;
            return client?.name?.toLowerCase().includes(searchClientByText.toLowerCase());
        });
        setFilterClient(filteredClient);
    }, [clients, searchClientByText]);

    const handleRowClick = (clientId) => {
        navigate(`/admin/client/details/${clientId}`);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Table for Clients */}
            <Table className="bg-white shadow-md rounded-lg overflow-hidden">
                <TableCaption className="text-lg font-semibold text-gray-700">
                    A List of your recent registered clients
                </TableCaption>
                <TableHeader className="bg-blue-600 text-white">
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterClient.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500">
                                    No Clients to show
                                </TableCell>
                            </TableRow>
                        ) : (
                            filterClient.map((client) => (
                                <TableRow
                                    key={client._id}
                                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                    onClick={() => handleRowClick(client._id)}
                                >
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={client.logo || "https://via.placeholder.com/200"} alt={`${client.name} Logo`} />
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>
                                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        <Popover>
                                            <PopoverTrigger>
                                                <MoreHorizontal className="text-gray-600 hover:text-blue-600" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-32 p-2 border border-gray-300 rounded-lg shadow-lg">
                                                <div
                                                    onClick={() => navigate(`/admin/clients/${client._id}`)}
                                                    className='flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-200 rounded'
                                                    aria-label={`Edit ${client.name}`}
                                                >
                                                    <Edit2 className='w-4 text-blue-500' />
                                                    <span>Edit</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            ))
                        )
                    }
                </TableBody>
            </Table>

          
        </div>
    );
};

export default ClientsTable;
