# MongoDB Atlas Setup Guide - FREE Tier

## Quick Setup (5 minutes)

### 1. Create Account
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up (FREE, no credit card)

### 2. Create FREE Cluster
- Choose **M0 FREE** tier (512 MB)
- Select region closest to you
- Click "Create"

### 3. Create Database User
- Database Access → Add New User
- Username: `fieldtech_admin`
- Password: `YourSecurePassword123`
- Role: "Atlas admin" or "Read and write to any database"

### 4. Whitelist IP
- Network Access → Add IP Address
- For development: "Allow Access from Anywhere" (0.0.0.0/0)
- For production: Add specific IPs

### 5. Get Connection String
- Database → Connect → Connect your application
- Copy connection string:
```
mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## Update Service `.env` Files

**IMPORTANT:** Databases are created automatically when services connect!

### Auth Service (.env)
```env
AUTH_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_auth?retryWrites=true&w=majority
```

### Company Service (.env)
```env
COMPANY_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_company?retryWrites=true&w=majority
```

### Workorder Service (.env)
```env
WORKORDER_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_workorder?retryWrites=true&w=majority
```

### Review Service (.env)
```env
REVIEW_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_review?retryWrites=true&w=majority
```

### Payment Service (.env)
```env
PAYMENT_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_payment?retryWrites=true&w=majority
```

### Chat Service (.env)
```env
CHAT_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_chat?retryWrites=true&w=majority
```

### Notification Service (.env)
```env
NOTIFICATION_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_notification?retryWrites=true&w=majority
```

### Client Service (.env)
```env
CLIENT_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_client?retryWrites=true&w=majority
```

### Admin Service (.env)
```env
ADMIN_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_admin?retryWrites=true&w=majority
```

### Application Service (.env)
```env
APPLICATION_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_application?retryWrites=true&w=majority
```

### Search Service (.env)
```env
SEARCH_DB_URI=mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/fieldtech_search?retryWrites=true&w=majority
```

---

## Verify Databases Created

After starting all services, check in MongoDB Atlas:

1. Go to "Database" → "Browse Collections"
2. You should see all 11 databases:
   - fieldtech_auth
   - fieldtech_company
   - fieldtech_workorder
   - fieldtech_review
   - fieldtech_payment
   - fieldtech_chat
   - fieldtech_notification
   - fieldtech_client
   - fieldtech_admin
   - fieldtech_application
   - fieldtech_search

---

## Optional: Manual Database Creation Script

If you want to pre-create databases (not required):

```javascript
// create-databases.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://fieldtech_admin:YourSecurePassword123@cluster0.xxxxx.mongodb.net/";
const client = new MongoClient(uri);

const databases = [
  'fieldtech_auth',
  'fieldtech_company',
  'fieldtech_workorder',
  'fieldtech_review',
  'fieldtech_payment',
  'fieldtech_chat',
  'fieldtech_notification',
  'fieldtech_client',
  'fieldtech_admin',
  'fieldtech_application',
  'fieldtech_search'
];

async function createDatabases() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    for (const dbName of databases) {
      const db = client.db(dbName);
      await db.collection('_init').insertOne({ 
        createdAt: new Date(),
        purpose: 'Database initialization'
      });
      console.log(`✅ Database created: ${dbName}`);
    }
    
    console.log('\n🎉 All databases created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createDatabases();
```

Run with:
```bash
node create-databases.js
```

---

## Cost Breakdown

### FREE Tier (M0)
- **Storage:** 512 MB (shared across all 11 databases)
- **RAM:** Shared
- **Databases:** Unlimited
- **Collections:** Unlimited
- **Cost:** $0 forever ✅

### When to Upgrade
- When you exceed 512 MB total storage
- When you need better performance
- When you go to production

### Paid Tiers (Future)
- **M10:** ~$57/month (2GB RAM, 10GB storage)
- **M20:** ~$144/month (4GB RAM, 20GB storage)

---

## Advantages of MongoDB Atlas

✅ **Free for development**
✅ **Cloud-hosted** (access from anywhere)
✅ **Automatic backups**
✅ **Built-in monitoring**
✅ **Easy to scale**
✅ **Team collaboration**

---

## Local vs Cloud Comparison

| Feature | Local MongoDB | MongoDB Atlas Free |
|---------|--------------|-------------------|
| Cost | $0 | $0 |
| Storage | Unlimited | 512 MB |
| Speed | Fastest | Good |
| Access | Localhost only | Anywhere |
| Backups | Manual | Automatic |
| Best For | Solo dev | Team/Cloud dev |

---

## Recommendation

**For Development:**
- Use **Local MongoDB** (what you have now) - FREE & FAST
- Or use **MongoDB Atlas M0** - FREE & CLOUD

**For Production:**
- Upgrade to **MongoDB Atlas M10+** ($57/month)
- Or self-host on **DigitalOcean/AWS** ($10-20/month)

Both options are completely FREE for development! 🎉
