import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesDir = path.join(__dirname, 'services');

// List of services to start
// We include the root 'backend' as a service too
const services = [
    { name: 'api-gateway', path: __dirname }, // The root backend
    { name: 'auth-service', path: path.join(servicesDir, 'auth-service') },
    { name: 'company-service', path: path.join(servicesDir, 'company-service') },
    { name: 'workorder-service', path: path.join(servicesDir, 'workorder-service') },
    { name: 'review-service', path: path.join(servicesDir, 'review-service') },
    { name: 'payment-service', path: path.join(servicesDir, 'payment-service') },
    { name: 'chat-service', path: path.join(servicesDir, 'chat-service') },
    { name: 'notification-service', path: path.join(servicesDir, 'notification-service') },
    { name: 'client-service', path: path.join(servicesDir, 'client-service') },
    { name: 'admin-service', path: path.join(servicesDir, 'admin-service') },
    { name: 'application-service', path: path.join(servicesDir, 'application-service') },
    { name: 'search-service', path: path.join(servicesDir, 'search-service') }
];

// Colors for output
const colors = [
    '\x1b[32m', // Green
    '\x1b[33m', // Yellow
    '\x1b[34m', // Blue
    '\x1b[35m', // Magenta
    '\x1b[36m', // Cyan
    '\x1b[31m', // Red
    '\x1b[90m', // Gray
    '\x1b[92m', // Bright Green
    '\x1b[93m', // Bright Yellow
    '\x1b[94m', // Bright Blue
    '\x1b[95m', // Bright Magenta
    '\x1b[96m', // Bright Cyan
];

console.log('🚀 Starting API Gateway and all Microservices concurrently...\n');

const processes = [];

services.forEach((service, index) => {
    if (!fs.existsSync(service.path)) {
        console.warn(`⚠️ Skipped ${service.name} (directory not found)`);
        return;
    }

    const color = colors[index % colors.length];
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    console.log(`${color}▶ Starting ${service.name}... \x1b[0m`);

    // Use 'dev' script (nodemon) for auto-restart
    const child = spawn(npmCmd, ['run', 'dev'], {
        cwd: service.path,
        shell: true,
        stdio: 'pipe'
    });

    processes.push(child);

    // Padding for alignment
    const padding = ' '.repeat(Math.max(0, 20 - service.name.length));
    const prefix = `${color}[${service.name}]${padding}| \x1b[0m`;

    child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) console.log(prefix + line);
        });
    });

    child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) console.error(prefix + data.toString());
        });
    });

    child.on('close', (code) => {
        console.log(`${prefix}Process exited with code ${code}`);
    });

    child.on('error', (err) => {
        console.error(`${prefix}Failed to start: ${err.message}`);
    });
});

console.log('\n✅ All services initiated. Logs will appear below:\n');

// Handle termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down all services...');
    processes.forEach(p => p.kill());
    process.exit();
});
