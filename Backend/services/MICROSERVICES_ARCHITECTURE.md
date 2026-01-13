# Microservices Architecture Guide: Models & Controllers

## Core Principle: **Each Service Owns Its Data**

Yes, **each service should have its own models and controllers**. This is a fundamental principle of microservices architecture.

## 📋 Architecture Strategy

### 1. **Models per Service** ✅

Each microservice should:
- **Own its domain models** (the data it's responsible for)
- **Not directly access other services' models** (no cross-service database queries)
- **Store only what it needs** (avoid duplicating entire models)

### 2. **Controllers per Service** ✅

Each microservice should:
- **Have its own controllers** (business logic for that domain)
- **Handle its own HTTP requests/responses**
- **Not call other services' controllers directly** (use HTTP/gRPC instead)

## 🏗️ Service Boundaries & Data Ownership

### Auth Service
**Owns:**
- `User` model (complete user data)
- User authentication & authorization logic

**Does NOT own:**
- Workorders, Companies, Projects (these belong to other services)

### Workorder Service (Future)
**Owns:**
- `Workorder` model
- Job posting & assignment logic

**References (but doesn't own):**
- `userId` (technician) - stored as ID, fetched from Auth Service when needed
- `clientId` - stored as ID, fetched from Client Service when needed
- `projectId` - stored as ID, fetched from Client Service when needed

### Client/Project Service (Future)
**Owns:**
- `Client` model
- `Project` model
- Client & project management logic

**References:**
- `companyId` - stored as ID, fetched from Company Service when needed

## 🔄 Handling Cross-Service References

### Strategy 1: **Store IDs Only** (Recommended)

**Example: Workorder Service**

```javascript
// ❌ DON'T: Import User model directly
import { User } from '../Models/user.model.js'; // Wrong!

// ✅ DO: Store user ID only
const workorderSchema = new mongoose.Schema({
    title: { type: String },
    technicianId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
        // No ref: "User" - User belongs to Auth Service
    },
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Client" // Client belongs to Client Service
    }
});
```

**When you need user data:**

```javascript
// In Workorder Controller
export const getWorkorder = async (req, res) => {
    const workorder = await Workorder.findById(req.params.id);
    
    // Fetch user data from Auth Service
    const userResponse = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${workorder.technicianId}`, {
        headers: { 'Authorization': `Bearer ${req.headers.authorization}` }
    });
    const userData = await userResponse.json();
    
    // Combine data
    return res.json({
        ...workorder.toObject(),
        technician: userData.user
    });
};
```

### Strategy 2: **Event-Driven Data Synchronization** (Advanced)

For frequently accessed data, maintain a **read-only copy**:

```javascript
// Workorder Service maintains a lightweight user cache
const technicianCacheSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    fullname: { type: String },
    email: { type: String },
    role: { type: String },
    // Only fields needed by Workorder Service
    lastSynced: { type: Date }
});
```

**Update via events:**
- Auth Service publishes "user.updated" event
- Workorder Service subscribes and updates cache

### Strategy 3: **API Gateway Aggregation** (For Complex Queries)

```javascript
// API Gateway aggregates data from multiple services
app.get('/api/v1/workorders/:id/full', async (req, res) => {
    // Fetch from Workorder Service
    const workorder = await fetch(`${WORKORDER_SERVICE}/api/v1/workorders/${req.params.id}`);
    
    // Fetch related data from other services
    const technician = await fetch(`${AUTH_SERVICE}/api/v1/auth/users/${workorder.technicianId}`);
    const client = await fetch(`${CLIENT_SERVICE}/api/v1/clients/${workorder.clientId}`);
    
    // Combine and return
    return res.json({
        workorder: workorder.data,
        technician: technician.data,
        client: client.data
    });
});
```

## 📊 Database Strategy

### Option 1: **Shared Database** (Migration Phase)

**Pros:**
- Easier migration
- No data duplication
- Can use MongoDB references during transition

**Cons:**
- Services are still coupled
- Not true microservices
- Harder to scale independently

**Implementation:**
```javascript
// All services connect to same MongoDB
// But each service only queries its own collections
const MONGO_URI = process.env.MONGO_URI; // Same for all services
```

### Option 2: **Database per Service** (Target Architecture)

**Pros:**
- True service independence
- Independent scaling
- Technology flexibility (can use different DBs)

**Cons:**
- More complex data synchronization
- Need event bus or API calls for relationships

**Implementation:**
```javascript
// Auth Service
const MONGO_URI = process.env.AUTH_DB_URI; // mongodb://localhost:27017/shiftmate_auth

// Workorder Service  
const MONGO_URI = process.env.WORKORDER_DB_URI; // mongodb://localhost:27017/shiftmate_workorders

// Client Service
const MONGO_URI = process.env.CLIENT_DB_URI; // mongodb://localhost:27017/shiftmate_clients
```

## 🎯 Recommended Approach for ShiftMate

### Phase 1: **Shared Database with Service Boundaries** (Current)

1. All services use same MongoDB instance
2. Each service has its own models
3. Services communicate via HTTP API calls
4. No direct model imports across services

### Phase 2: **Separate Databases** (Future)

1. Migrate to database-per-service
2. Implement event bus for data synchronization
3. Use API Gateway for complex queries

## 📝 Example: Workorder Service Structure

```
services/workorder-service/
├── Models/
│   └── workorder.model.js          # Only Workorder model
│   └── technician-cache.model.js # Optional: cached user data
├── Controllers/
│   └── workorder.controller.js     # Workorder business logic
├── Services/
│   └── auth-client.service.js      # HTTP client for Auth Service
│   └── client-client.service.js    # HTTP client for Client Service
└── Routes/
    └── workorder.route.js
```

**workorder.model.js:**
```javascript
// ✅ Only Workorder fields
const workorderSchema = new mongoose.Schema({
    title: { type: String },
    technicianId: { type: String }, // ID only, no ref
    clientId: { type: String },    // ID only, no ref
    projectId: { type: String },   // ID only, no ref
    // ... other workorder fields
});
```

**workorder.controller.js:**
```javascript
import { Workorder } from '../Models/workorder.model.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { ClientServiceClient } from '../Services/client-client.service.js';

export const getWorkorder = async (req, res) => {
    const workorder = await Workorder.findById(req.params.id);
    
    // Fetch related data from other services
    const [technician, client] = await Promise.all([
        AuthServiceClient.getUser(workorder.technicianId),
        ClientServiceClient.getClient(workorder.clientId)
    ]);
    
    return res.json({
        ...workorder.toObject(),
        technician,
        client
    });
};
```

**auth-client.service.js:**
```javascript
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

export class AuthServiceClient {
    static async getUser(userId, token) {
        const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    }
}
```

## ✅ Best Practices Summary

1. **Each service owns its models** ✅
2. **Each service has its own controllers** ✅
3. **Store IDs, not full objects** for cross-service references
4. **Use HTTP clients** to fetch data from other services
5. **No direct model imports** across services
6. **Start with shared DB**, migrate to separate DBs later
7. **Use API Gateway** for complex aggregations
8. **Consider event bus** for real-time data sync

## 🚀 Migration Checklist

When extracting a new service:

- [ ] Create service directory structure
- [ ] Copy only **relevant models** (not all models)
- [ ] Remove **cross-service model references**
- [ ] Replace with **ID fields only**
- [ ] Create **service clients** for fetching related data
- [ ] Update **controllers** to use service clients
- [ ] Test **service independence** (can run without other services)

## 📚 Additional Resources

- See `MIGRATION_GUIDE.md` for step-by-step migration process
- See `AUTH_SERVICE_SUMMARY.md` for Auth Service implementation example
