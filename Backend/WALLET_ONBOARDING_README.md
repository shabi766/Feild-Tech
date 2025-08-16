# Wallet Onboarding System

This document describes the new wallet onboarding system that implements KYC verification and passcode management for secure wallet access.

## Overview

The wallet onboarding system consists of two main components:
1. **KYC (Know Your Customer) Verification** - Multi-step identity verification process
2. **Wallet Passcode Management** - Secure 6-digit passcode system for wallet access

## System Flow

```
User Registration → KYC Submission → Admin Review → KYC Approval → Passcode Setup → Wallet Access
```

## Components

### 1. KYC Model (`Models/kyc.model.js`)

**Purpose**: Stores user verification information and documents

**Key Fields**:
- Personal Information (father's name, CNIC, DOB, address, etc.)
- Financial Information (occupation, employer, income, source of funds)
- Emergency Contact
- Document URLs (CNIC front/back, selfie, utility bill)
- KYC Status (unverified, pending, verified, rejected)
- Admin Review Information
- Audit Trail

**Methods**:
- `updateStatus(newStatus, adminId, notes)` - Update KYC status
- `addUpdateHistory(field, oldValue, newValue, updatedBy)` - Track changes

**Indexes**:
- `userId` (unique)
- `kycStatus`
- `submittedAt`
- `reviewedBy`
- `expiryDate`

### 2. Wallet Passcode Model (`Models/walletPasscode.model.js`)

**Purpose**: Manages secure 6-digit passcodes for wallet access

**Key Fields**:
- Hashed passcode (encrypted with bcrypt)
- Security settings (max attempts, lockout duration)
- Lockout status and tracking
- Access history and audit trail
- Passcode history (prevents reuse)

**Methods**:
- `verifyPasscode(inputPasscode)` - Verify passcode with security features
- `changePasscode(newPasscode, changedBy)` - Change passcode
- `resetPasscode(newPasscode, resetBy)` - Admin reset
- `unlockWallet(unlockedBy)` - Admin unlock

**Security Features**:
- 3 failed attempts = temporary lockout (5 minutes)
- Passcode history tracking (prevents reuse of last 5 passcodes)
- Audit trail for all operations

### 3. KYC Controller (`Controllers/kyc.controller.js`)

**Endpoints**:
- `POST /api/v1/kyc/submit` - Submit KYC application
- `GET /api/v1/kyc/status` - Get current user's KYC status
- `GET /api/v1/kyc/admin/all` - Get all KYC applications (admin)
- `PUT /api/v1/kyc/admin/:kycId/status` - Update KYC status (admin)
- `GET /api/v1/kyc/admin/statistics` - Get KYC statistics (admin)

**Features**:
- File upload handling (CNIC, selfie, utility bill)
- Validation of required fields
- Status management with admin review
- Comprehensive error handling

### 4. Wallet Passcode Controller (`Controllers/walletPasscode.controller.js`)

**Endpoints**:
- `POST /api/v1/wallet-passcode/create` - Create wallet passcode
- `POST /api/v1/wallet-passcode/verify` - Verify passcode
- `PUT /api/v1/wallet-passcode/change` - Change passcode
- `GET /api/v1/wallet-passcode/status` - Get passcode status
- `PUT /api/v1/wallet-passcode/admin/:userId/reset` - Admin reset (admin)
- `PUT /api/v1/wallet-passcode/admin/:userId/unlock` - Admin unlock (admin)

**Features**:
- Secure passcode creation and verification
- Automatic lockout on failed attempts
- Admin override capabilities
- Comprehensive status reporting

## API Endpoints

### KYC Routes

```javascript
// User routes (require authentication)
POST /api/v1/kyc/submit          // Submit KYC application
GET  /api/v1/kyc/status          // Get KYC status

// Admin routes (require admin authentication)
GET  /api/v1/kyc/admin/all       // Get all KYC applications
GET  /api/v1/kyc/admin/statistics // Get KYC statistics
GET  /api/v1/kyc/admin/:kycId    // Get KYC details
PUT  /api/v1/kyc/admin/:kycId/status // Update KYC status
DELETE /api/v1/kyc/admin/:kycId  // Delete KYC application
```

### Wallet Passcode Routes

```javascript
// User routes (require authentication)
POST /api/v1/wallet-passcode/create    // Create wallet passcode
POST /api/v1/wallet-passcode/verify    // Verify passcode
PUT  /api/v1/wallet-passcode/change    // Change passcode
GET  /api/v1/wallet-passcode/status    // Get passcode status

// Admin routes (require admin authentication)
PUT  /api/v1/wallet-passcode/admin/:userId/reset   // Reset passcode
PUT  /api/v1/wallet-passcode/admin/:userId/unlock  // Unlock wallet
GET  /api/v1/wallet-passcode/admin/locked          // Get locked wallets
DELETE /api/v1/wallet-passcode/admin/:userId       // Delete passcode
```

## Frontend Integration

### Wallet Status Flow

The frontend `Wallets.jsx` component manages the wallet onboarding flow:

1. **Checking Status** - Calls `/api/v1/kyc/status` and `/api/v1/wallet-passcode/status`
2. **KYC Required** - Shows `WalletOnboarding` component
3. **KYC Pending** - Shows pending status with information
4. **Passcode Required** - Shows `PasscodeSetup` component
5. **Ready** - Shows `NewWalletDashboard` with passcode protection

### Component Communication

```javascript
// KYC submission
const handleSubmit = async (formData) => {
  const res = await axios.post('/api/v1/kyc/submit', formData);
  if (res.data.success) {
    onComplete('kyc_approved');
  }
};

// Passcode setup
const handleSubmit = async (passcode) => {
  const res = await axios.post('/api/v1/wallet-passcode/create', { passcode });
  if (res.data.success) {
    onComplete('passcode_set');
  }
};

// Passcode verification
const handleSubmit = async (passcode) => {
  const res = await axios.post('/api/v1/wallet-passcode/verify', { passcode });
  if (res.data.success) {
    onSuccess();
  }
};
```

## Security Features

### KYC Security
- Document validation and file type restrictions
- Admin review process for verification
- Audit trail for all status changes
- Expiry dates for verified KYC

### Passcode Security
- 6-digit numeric passcodes
- Bcrypt hashing (12 rounds)
- Automatic lockout after 3 failed attempts
- 5-minute lockout duration
- Passcode history prevention
- Admin override capabilities

### File Upload Security
- File size limits (5MB)
- File type validation (images and PDFs only)
- S3 storage with secure URLs
- Multer middleware for handling uploads

## Testing

### Test Script
Run the test script to verify the backend setup:

```bash
cd Backend
node testWalletOnboarding.js
```

This script tests:
- Model creation and validation
- KYC workflow
- Passcode operations
- Security features
- Admin functions

### Manual Testing
1. Submit KYC application with documents
2. Admin review and approval
3. Passcode setup
4. Passcode verification
5. Test security features (lockout, etc.)

## Database Schema

### KYC Collection
```javascript
{
  userId: ObjectId,
  fatherName: String,
  cnicNumber: String,
  dateOfBirth: Date,
  address: String,
  city: String,
  postalCode: String,
  occupation: String,
  employer: String,
  monthlyIncome: String,
  sourceOfFunds: String,
  purposeOfAccount: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  documents: {
    cnicFront: String,
    cnicBack: String,
    selfie: String,
    utilityBill: String
  },
  kycStatus: String, // 'unverified', 'pending', 'verified', 'rejected'
  reviewedBy: ObjectId,
  reviewedAt: Date,
  reviewNotes: String,
  rejectionReason: String,
  verificationDate: Date,
  expiryDate: Date,
  updateHistory: Array
}
```

### WalletPasscode Collection
```javascript
{
  userId: ObjectId,
  hashedPasscode: String,
  passcodeLength: Number,
  maxAttempts: Number,
  lockoutDuration: Number,
  isLocked: Boolean,
  lockoutUntil: Date,
  failedAttempts: Number,
  lastFailedAttempt: Date,
  lastSuccessfulAccess: Date,
  accessCount: Number,
  passcodeHistory: Array,
  expiresAt: Date,
  changeHistory: Array
}
```

## Environment Variables

Ensure these environment variables are set:

```bash
MONGO_URI=mongodb://localhost:27017/your_database
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

## Dependencies

### Backend Dependencies
- `mongoose` - Database ODM
- `bcryptjs` - Password hashing
- `multer` - File upload handling
- `express` - Web framework

### Frontend Dependencies
- `axios` - HTTP client
- `react-redux` - State management
- `framer-motion` - Animations
- `lucide-react` - Icons
- `sonner` - Toast notifications

## Future Enhancements

1. **Automated KYC Verification** - Integration with third-party verification services
2. **Biometric Authentication** - Fingerprint or face recognition
3. **Multi-Factor Authentication** - SMS/email verification codes
4. **Advanced Security** - Hardware security modules (HSM)
5. **Compliance Reporting** - Automated regulatory reporting
6. **Risk Scoring** - AI-powered risk assessment

## Troubleshooting

### Common Issues

1. **File Upload Failures**
   - Check file size limits
   - Verify file types
   - Ensure S3 credentials are correct

2. **Passcode Verification Issues**
   - Check if wallet is locked
   - Verify passcode format (6 digits)
   - Check failed attempts count

3. **KYC Status Issues**
   - Verify admin permissions
   - Check required fields
   - Ensure proper workflow

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=wallet-onboarding:*
```

## Support

For technical support or questions about the wallet onboarding system, please refer to:
- API documentation
- Database schemas
- Test scripts
- Frontend component examples
