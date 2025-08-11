import mongoose from 'mongoose';
import AuditService from './utils/auditService.js';
import { connectDB } from './utils/db.js';

/**
 * Test script to verify audit logging functionality
 */
async function testAuditLog() {
    try {
        console.log('Testing audit logging functionality...');
        
        // Connect to database
        await connectDB();
        console.log('Connected to database');
        
        // Test 1: Anonymous user audit log
        console.log('\nTest 1: Anonymous user audit log');
        const anonymousLog = await AuditService.log({
            action: 'post_login',
            resourceType: 'api_endpoint',
            userIp: '192.168.1.1',
            userAgent: 'Test Browser',
            details: { test: 'anonymous_user' }
        });
        console.log('Anonymous log result:', anonymousLog ? 'SUCCESS' : 'FAILED');
        
        // Test 2: Authenticated user audit log
        console.log('\nTest 2: Authenticated user audit log');
        const authenticatedLog = await AuditService.log({
            userId: new mongoose.Types.ObjectId(),
            action: 'get_profile',
            resourceType: 'user',
            userEmail: 'test@example.com',
            userRole: 'user',
            userIp: '192.168.1.2',
            userAgent: 'Test Browser',
            details: { test: 'authenticated_user' }
        });
        console.log('Authenticated log result:', authenticatedLog ? 'SUCCESS' : 'FAILED');
        
        // Test 3: System event audit log
        console.log('\nTest 3: System event audit log');
        const systemLog = await AuditService.logSystemEvent(
            'system_maintenance',
            'system',
            { test: 'system_event' }
        );
        console.log('System log result:', systemLog ? 'SUCCESS' : 'FAILED');
        
        // Test 4: Suspicious activity audit log
        console.log('\nTest 4: Suspicious activity audit log');
        const suspiciousLog = await AuditService.logSuspiciousActivity(
            null, // Anonymous user
            'multiple_failed_logins',
            { ip: '192.168.1.3', method: 'POST', path: '/login' },
            ['brute_force_attempt'],
            { attempts: 5 }
        );
        console.log('Suspicious log result:', suspiciousLog ? 'SUCCESS' : 'FAILED');
        
        console.log('\nAll tests completed!');
        
        // Disconnect from database
        await mongoose.disconnect();
        console.log('Disconnected from database');
        
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testAuditLog();
}

export default testAuditLog;
