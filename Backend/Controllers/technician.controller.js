import { User } from '../Models/user.model.js';

// Controller to get all technicians
export const getTechnicians = async (req, res) => {
    try {
        const technicians = await User.find({ role: 'Technician' });

        if (!technicians || technicians.length === 0) { // Check for both null and empty array
            return res.status(404).json({
                message: 'No technicians found.',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Technicians fetched successfully.',
            success: true,
            technicians,
        });
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return res.status(500).json({
            message: 'Failed to fetch technicians.',
            success: false,
            error: error.message, // Include error message
        });
    }
};

// Controller to get a specific technician by ID
export const getTechnicianById = async (req, res) => {
    const { id } = req.params;

    try {
        const technician = await User.findById(id);

        if (!technician || technician.role !== 'Technician') {
            return res.status(404).json({
                message: 'Technician not found.',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Technician fetched successfully.',
            success: true,
            technician,
        });
    } catch (error) {
        console.error('Error fetching technician:', error);
        return res.status(500).json({
            message: 'Failed to fetch technician.',
            success: false,
            error: error.message, // Include error message
        });
    }
};