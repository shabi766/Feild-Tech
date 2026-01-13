# Models & Controllers in Microservices - Quick Guide

## Your Question: Should each service have its own models and controllers?

## Answer: **YES, absolutely!** ✅

## Quick Summary

### ✅ Each Service Should Have:
1. **Its own Models** - Only for data it owns
2. **Its own Controllers** - Business logic for its domain
3. **Its own Routes** - HTTP endpoints
4. **Service Clients** - To fetch data from other services

### ❌ Each Service Should NOT:
1. Import models from other services
2. Directly query other services' databases
3. Share controllers with other services

## Example Structure

```
services/
├── auth-service/
│   ├── Models/user.model.js          ✅ Owns User data
│   ├── Controllers/auth.controller.js ✅ Auth logic
│   └── Routes/auth.route.js
│
├── workorder-service/ (future)
│   ├── Models/workorder.model.js     ✅ Owns Workorder data
│   ├── Controllers/workorder.controller.js ✅ Workorder logic
│   ├── Services/auth-client.service.js ✅ Fetches users from Auth Service
│   └── Routes/workorder.route.js
│
└── client-service/ (future)
    ├── Models/client.model.js        ✅ Owns Client data
    ├── Models/project.model.js        ✅ Owns Project data
    ├── Controllers/client.controller.js ✅ Client logic
    └── Routes/client.route.js
```

## How to Handle Cross-Service Data

### ❌ WRONG: Direct Model Import

```javascript
// ❌ DON'T DO THIS in Workorder Service
import { User } from '../../auth-service/Models/user.model.js';

const workorder = await Workorder.findById(id);
const user = await User.findById(workorder.technicianId); // WRONG!
```

### ✅ CORRECT: Use Service Clients

```javascript
// ✅ DO THIS instead
import { AuthServiceClient } from '../Services/auth-client.service.js';

const workorder = await Workorder.findById(id);
const user = await AuthServiceClient.getUser(workorder.technicianId, token);
```

## Model Design: Store IDs, Not References

### ✅ CORRECT: Store IDs Only

```javascript
// Workorder Model
const workorderSchema = new mongoose.Schema({
    title: { type: String },
    technicianId: { 
        type: mongoose.Schema.Types.ObjectId,
        // NO ref: "User" - User belongs to Auth Service
    },
    clientId: { 
        type: mongoose.Schema.Types.ObjectId,
        // NO ref: "Client" - Client belongs to Client Service
    }
});
```

### ❌ WRONG: MongoDB References

```javascript
// ❌ DON'T USE refs across services
technicianId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" // WRONG! User is in Auth Service
}
```

## Real Example: Workorder Controller

```javascript
import { Workorder } from '../Models/workorder.model.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { ClientServiceClient } from '../Services/client-client.service.js';

export const getWorkorder = async (req, res) => {
    // 1. Get workorder from own database
    const workorder = await Workorder.findById(req.params.id);
    
    // 2. Fetch related data from other services
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    const [technician, client] = await Promise.all([
        AuthServiceClient.getUser(workorder.technicianId, token),
        ClientServiceClient.getClient(workorder.clientId, token)
    ]);
    
    // 3. Combine and return
    return res.json({
        workorder: workorder.toObject(),
        technician,
        client
    });
};
```

## Database Strategy

### Phase 1: Shared Database (Current - Easier Migration)

All services connect to same MongoDB, but:
- Each service only queries its own collections
- No cross-service model imports
- Use HTTP clients for related data

```javascript
// All services use same MONGO_URI
const MONGO_URI = process.env.MONGO_URI; // mongodb://localhost:27017/shiftmate
```

### Phase 2: Database per Service (Future - True Microservices)

Each service has its own database:

```javascript
// Auth Service
const MONGO_URI = process.env.AUTH_DB_URI; // mongodb://localhost:27017/shiftmate_auth

// Workorder Service
const MONGO_URI = process.env.WORKORDER_DB_URI; // mongodb://localhost:27017/shiftmate_workorders
```

## Available Service Clients

We've created service clients for inter-service communication:

### Auth Service Client

```javascript
import { AuthServiceClient } from '../shared-clients/auth-client.service.js';

// Get single user
const user = await AuthServiceClient.getUser(userId, token);

// Get multiple users
const users = await AuthServiceClient.getUsers([userId1, userId2], token);

// Verify token
const userData = await AuthServiceClient.verifyToken(token);
```

**Auth Service Endpoints:**
- `GET /api/v1/auth/users/:userId` - Get user by ID
- `POST /api/v1/auth/users/batch` - Get multiple users
- `POST /api/v1/auth/verify` - Verify token

## Migration Checklist

When extracting a new service:

- [ ] ✅ Create service directory
- [ ] ✅ Copy **only relevant models** (not all models)
- [ ] ✅ Remove **MongoDB refs** to other services' models
- [ ] ✅ Replace refs with **ID fields only**
- [ ] ✅ Create **service clients** for fetching related data
- [ ] ✅ Update **controllers** to use service clients
- [ ] ✅ Test **service independence**

## Key Takeaways

1. ✅ **Each service owns its models** - Only models for its domain
2. ✅ **Each service has its own controllers** - Business logic for its domain
3. ✅ **Store IDs, fetch objects** - Use service clients to get related data
4. ✅ **No cross-service model imports** - Use HTTP clients instead
5. ✅ **Start with shared DB** - Migrate to separate DBs later

## Next Steps

1. Review `ARCHITECTURE_DECISIONS.md` for detailed decisions
2. Review `MICROSERVICES_ARCHITECTURE.md` for full architecture guide
3. Use `shared-clients/auth-client.service.js` as template for other clients
4. When creating Workorder Service, follow this pattern

## Questions?

- See `ARCHITECTURE_DECISIONS.md` for detailed explanations
- See `MICROSERVICES_ARCHITECTURE.md` for complete architecture guide
- See `MIGRATION_GUIDE.md` for step-by-step migration process
