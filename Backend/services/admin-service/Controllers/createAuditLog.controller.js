import AuditLog from '../Models/auditLog.model.js';

/**
 * Create a new audit log entry (called by microservices)
 */
export const createAuditLog = async (req, res) => {
    try {
        const {
            service,
            eventType,
            userId,
            level,
            description,
            metadata,
            ipAddress,
            userAgent,
            timestamp
        } = req.body;

        // Validate required fields
        if (!service || !eventType || !description) {
            return res.status(400).json({
                success: false,
                message: 'Service, eventType, and description are required'
            });
        }

        // Create audit log entry
        const auditLog = await AuditLog.create({
            service,
            eventType,
            userId,
            level: level || 'info',
            description,
            metadata: metadata || {},
            ipAddress,
            userAgent,
            timestamp: timestamp || new Date(),
            createdAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: 'Audit log created successfully',
            data: { id: auditLog._id }
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create audit log',
            error: error.message
        });
    }
};
