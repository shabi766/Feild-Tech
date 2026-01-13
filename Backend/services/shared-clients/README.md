# Shared Service Clients

HTTP clients for inter-service communication. These clients allow services to fetch data from other services without direct database access.

## Usage

### In Workorder Service

```javascript
import { AuthServiceClient } from '../shared-clients/auth-client.service.js';

// In your controller
export const getWorkorder = async (req, res) => {
    const workorder = await Workorder.findById(req.params.id);
    
    // Fetch technician data from Auth Service
    const technician = await AuthServiceClient.getUser(
        workorder.technicianId, 
        req.headers.authorization?.replace('Bearer ', '')
    );
    
    return res.json({
        ...workorder.toObject(),
        technician
    });
};
```

## Available Clients

- `auth-client.service.js` - Client for Auth Service
- `client-client.service.js` - Client for Client Service
- `notification-client.service.js` - Client for Notification Service

## Adding New Clients

When creating a new service, create a corresponding client:

```javascript
// client-service-client.js
const CLIENT_SERVICE_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:8002';

export class ClientServiceClient {
    static async getClient(clientId, token) {
        const response = await fetch(`${CLIENT_SERVICE_URL}/api/v1/clients/${clientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
}
```

## Environment Variables

Set these in each service's `.env`:

```env
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
CLIENT_SERVICE_URL=http://localhost:8003
NOTIFICATION_SERVICE_URL=http://localhost:8004
```
