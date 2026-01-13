# Architecture Decisions: Models & Controllers

## Question: Should each service have its own models and controllers?

## Answer: **YES** ✅

## Decision Summary

### ✅ Each Service Has Its Own:
1. **Models** - Only models for data it owns
2. **Controllers** - Business logic for its domain
3. **Routes** - HTTP endpoints
4. **Database** - Eventually (start with shared DB)

### ❌ Each Service Does NOT:
1. Import models from other services
2. Directly query other services' databases
3. Share controllers with other services

## Detailed Explanation

### Models Strategy

#### ✅ CORRECT: Service-Owned Models

```
Auth Service:
├── Models/user.model.js          ✅ Owns User data

Workorder Service:
├── Models/workorder.model.js      ✅ Owns Workorder data
└── Models/technician-cache.js    ✅ Optional: cached user data

Client Service:
├── Models/client.model.js         ✅ Owns Client data
└── Models/project.model.js       ✅ Owns Project data
```

#### ❌ WRONG: Cross-Service Model Imports

```javascript
// ❌ DON'T DO THIS in Workorder Service
import { User } from '../../auth-service/Models/user.model.js'; // WRONG!

// ✅ DO THIS instead
import { AuthServiceClient } from '../shared-clients/auth-client.service.js';
const user = await AuthServiceClient.getUser(userId, token);
```

### Controllers Strategy

#### ✅ CORRECT: Service-Specific Controllers

Each service handles its own domain:

```javascript
// Auth Service Controller
export const register = async (req, res) => {
    // Only handles user registration
    const user = await User.create(userData);
    return res.json({ user });
};

// Workorder Service Controller  
export const createWorkorder = async (req, res) => {
    // Only handles workorder creation
    const workorder = await Workorder.create(workorderData);
    
    // Fetch related data via HTTP clients
    const technician = await AuthServiceClient.getUser(workorder.technicianId, token);
    
    return res.json({ workorder, technician });
};
```

#### ❌ WRONG: Shared Controllers

```javascript
// ❌ DON'T: One controller handling multiple domains
export const createWorkorderWithUser = async (req, res) => {
    const user = await User.create(...);      // Auth domain
    const workorder = await Workorder.create(...); // Workorder domain
    // This couples services together!
};
```

## Data Relationships: How to Handle

### Strategy 1: Store IDs Only (Recommended)

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

### Strategy 2: Fetch Related Data via HTTP

```javascript
// Workorder Controller
export const getWorkorder = async (req, res) => {
    const workorder = await Workorder.findById(id);
    
    // Fetch from other services
    const [technician, client] = await Promise.all([
        AuthServiceClient.getUser(workorder.technicianId, token),
        ClientServiceClient.getClient(workorder.clientId, token)
    ]);
    
    return res.json({
        workorder,
        technician,
        client
    });
};
```

### Strategy 3: API Gateway Aggregation (For Complex Queries)

```javascript
// API Gateway
app.get('/api/v1/workorders/:id/full', async (req, res) => {
    const workorder = await WorkorderService.getWorkorder(id);
    const technician = await AuthService.getUser(workorder.technicianId);
    const client = await ClientService.getClient(workorder.clientId);
    
    return res.json({ workorder, technician, client });
});
```

## Database Strategy

### Phase 1: Shared Database (Current)

**All services connect to same MongoDB:**

```javascript
// Auth Service
const MONGO_URI = process.env.MONGO_URI; // mongodb://localhost:27017/shiftmate

// Workorder Service  
const MONGO_URI = process.env.MONGO_URI; // Same URI

// But each service only queries its own collections
```

**Pros:**
- Easier migration
- No data duplication
- Can use MongoDB references during transition

**Cons:**
- Services still coupled at database level
- Not true microservices independence

### Phase 2: Database per Service (Target)

**Each service has its own database:**

```javascript
// Auth Service
const MONGO_URI = process.env.AUTH_DB_URI; // mongodb://localhost:27017/shiftmate_auth

// Workorder Service
const MONGO_URI = process.env.WORKORDER_DB_URI; // mongodb://localhost:27017/shiftmate_workorders
```

**Pros:**
- True service independence
- Independent scaling
- Technology flexibility

**Cons:**
- More complex data synchronization
- Need event bus or API calls for relationships

## Real-World Example: Workorder Service

### ✅ Correct Structure

```
workorder-service/
├── Models/
│   └── workorder.model.js          # Only Workorder schema
│   └── technician-cache.model.js   # Optional: cached user data
├── Controllers/
│   └── workorder.controller.js      # Workorder business logic
├── Services/
│   └── auth-client.service.js       # HTTP client for Auth Service
│   └── client-client.service.js     # HTTP client for Client Service
└── Routes/
    └── workorder.route.js
```

### Example Controller

```javascript
import { Workorder } from '../Models/workorder.model.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { ClientServiceClient } from '../Services/client-client.service.js';

export const getWorkorder = async (req, res) => {
    try {
        // 1. Get workorder from own database
        const workorder = await Workorder.findById(req.params.id);
        if (!workorder) {
            return res.status(404).json({ message: 'Workorder not found' });
        }

        // 2. Fetch related data from other services
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        const [technician, client, project] = await Promise.all([
            AuthServiceClient.getUser(workorder.technicianId, token),
            ClientServiceClient.getClient(workorder.clientId, token),
            ClientServiceClient.getProject(workorder.projectId, token)
        ]);

        // 3. Combine and return
        return res.json({
            success: true,
            workorder: {
                ...workorder.toObject(),
                technician,
                client,
                project
            }
        });
    } catch (error) {
        console.error('Error fetching workorder:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching workorder',
            error: error.message 
        });
    }
};
```

## Migration Checklist

When extracting a service:

- [ ] ✅ Create service directory
- [ ] ✅ Copy **only relevant models** (not all models)
- [ ] ✅ Remove **cross-service model references** (ref: "User", ref: "Client")
- [ ] ✅ Replace with **ID fields only**
- [ ] ✅ Create **service clients** for fetching related data
- [ ] ✅ Update **controllers** to use service clients instead of direct model access
- [ ] ✅ Test **service independence** (can run without other services)

## Key Takeaways

1. **Each service owns its models** ✅
2. **Each service has its own controllers** ✅
3. **Services communicate via HTTP APIs**, not shared models
4. **Store IDs, fetch objects** when needed
5. **Start with shared DB**, migrate to separate DBs later
6. **Use service clients** for inter-service communication

## References

- See `MICROSERVICES_ARCHITECTURE.md` for detailed architecture guide
- See `MIGRATION_GUIDE.md` for step-by-step migration process
- See `shared-clients/` for service client examples
