import mongoose from 'mongoose';
import AuditService from './utils/auditService.js';
import { connectDB } from './utils/db.js';

/**
 * Migration script to add isAnonymous field to existing audit logs
 * Run this script after updating the audit log model
 */
async function migrateAuditLogs() {
    try {
        console.log('Starting audit log migration...');
        
        // Connect to database
        await connectDB();
        console.log('Connected to database');
        
        // Run migration
        const result = await AuditService.migrateIsAnonymous();
        console.log('Migration completed successfully:', result);
        
        // Disconnect from database
        await mongoose.disconnect();
        console.log('Disconnected from database');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateAuditLogs();
}

export default migrateAuditLogs;
