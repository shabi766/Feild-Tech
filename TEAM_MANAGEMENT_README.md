# Enhanced Team Management System

## Overview

The Enhanced Team Management System provides company managers with a comprehensive solution for managing their team members, roles, and permissions. This system supports the workflow where managers create accounts for other users who can then directly access the system using the credentials provided by their manager.

## Key Features

### 1. **Manager Account Creation Workflow**
- **Company Manager** creates accounts for team members
- **Automatic Role Assignment** - New users are automatically assigned the "Recruiter" role
- **Direct Login Access** - New users can immediately login with credentials provided by manager
- **No Email Verification Required** - Streamlined onboarding process

### 2. **Automatic Role Management**
- **Default Recruiter Role** - Automatically created if it doesn't exist
- **Permission Presets** - Pre-configured permissions for common recruiter tasks
- **Customizable** - Managers can override default roles with custom permissions

### 3. **User Invitation System**
- **Single User Invitation** - Invite individual team members
- **Bulk User Invitation** - Invite multiple users at once using CSV-like format
- **Credential Management** - Automatic generation and display of login credentials
- **Team Assignment** - Optionally assign users to specific teams during invitation

### 4. **Permission Management**
- **Granular Control** - Fine-grained permissions for different actions
- **Role-Based Access** - Users inherit permissions from their assigned role
- **Override Capability** - Individual user permission overrides when needed

## How It Works

### For Company Managers

#### 1. **Invite Individual User**
```javascript
// Manager invites a new team member
POST /api/company-users/{companyId}/invite
{
  "fullname": "John Doe",
  "email": "john@company.com",
  "phoneNumber": "+1234567890",
  "autoAssignRecruiterRole": true,  // Automatically assigns recruiter role
  "teamIds": ["team1", "team2"]     // Optional team assignments
}
```

**Response includes:**
- User account created automatically
- Login credentials (email, password, login URL)
- Automatic role assignment as "Recruiter"
- Company membership established

#### 2. **Bulk Invite Users**
```javascript
// Manager invites multiple team members
POST /api/company-users/{companyId}/bulk-invite
{
  "users": [
    {
      "fullname": "John Doe",
      "email": "john@company.com",
      "phoneNumber": "+1234567890"
    },
    {
      "fullname": "Jane Smith", 
      "email": "jane@company.com",
      "phoneNumber": "+0987654321"
    }
  ],
  "autoAssignRecruiterRole": true
}
```

**Bulk Process:**
- Creates multiple user accounts simultaneously
- Generates unique credentials for each user
- Assigns default recruiter role to all users
- Returns success/failure status for each invitation

#### 3. **Credential Management**
After successful invitation, managers receive:
- **Email**: User's email address
- **Password**: Auto-generated secure password
- **Login URL**: Direct link to login page
- **Copy/Download Options**: Easy sharing of credentials

### For New Team Members

#### 1. **Immediate Access**
- **No Email Verification** required
- **Direct Login** with provided credentials
- **Automatic Role Assignment** as "Recruiter"
- **Company Access** granted immediately

#### 2. **Default Permissions**
New users automatically get access to:
- **Job Management**: Create, edit, assign jobs
- **Client Management**: Create and manage clients
- **Basic Reporting**: View assigned reports
- **Team Collaboration**: Access to assigned teams

## Permission Structure

### Default Recruiter Role Permissions

```javascript
{
  // Job Management
  canCreateJobs: true,        // Can create new job postings
  canEditJobs: true,          // Can edit existing jobs
  canDeleteJobs: false,       // Cannot delete jobs (safety)
  canAssignJobs: true,        // Can assign jobs to technicians
  canViewAllJobs: true,       // Can see all company jobs
  
  // Team Management
  canCreateTeams: false,      // Cannot create new teams
  canEditTeams: false,        // Cannot modify team structure
  canManageTeamMembers: false, // Cannot manage team membership
  
  // Client Management
  canCreateClients: true,     // Can create new client records
  canEditClients: true,       // Can edit client information
  canViewAllClients: true,    // Can see all company clients
  
  // Financial Access
  canViewBudget: false,       // Cannot view company budget
  canManageBudget: false,     // Cannot modify budget
  canApprovePayments: false,  // Cannot approve payments
  
  // Reporting
  canViewReports: true,       // Can view assigned reports
  canGenerateReports: false,  // Cannot create new reports
  
  // User Management
  canInviteUsers: false,      // Cannot invite new users
  canChangeUserRoles: false,  // Cannot modify user roles
}
```

## Frontend Components

### 1. **TeamManagement.jsx**
- **Users Tab**: Primary interface for managing team members
- **Teams Tab**: Create and manage teams
- **Roles Tab**: Define and customize user roles
- **Credential Display**: Shows new user credentials after invitation

### 2. **Key Features**
- **Search & Filter**: Find users, teams, and roles quickly
- **Bulk Operations**: Invite multiple users simultaneously
- **Real-time Updates**: Immediate reflection of changes
- **Responsive Design**: Works on all device sizes

## Backend API Endpoints

### User Management
- `POST /api/company-users/{companyId}/invite` - Invite single user
- `POST /api/company-users/{companyId}/bulk-invite` - Bulk invite users
- `GET /api/company-users/{companyId}` - Get company users
- `PUT /api/company-users/{companyId}/{userId}` - Update user

### Team Management
- `POST /api/teams/{companyId}` - Create team
- `GET /api/teams/{companyId}` - Get company teams
- `PUT /api/teams/{teamId}` - Update team
- `DELETE /api/teams/{teamId}` - Delete team

### Role Management
- `POST /api/roles/{companyId}` - Create role
- `GET /api/roles/{companyId}` - Get company roles
- `PUT /api/roles/{roleId}` - Update role
- `DELETE /api/roles/{roleId}` - Delete role

## Security Features

### 1. **Credential Security**
- **Auto-generated Passwords**: Cryptographically secure random passwords
- **Temporary Storage**: Credentials only shown once after creation
- **Secure Sharing**: Copy/download options for secure credential transfer

### 2. **Access Control**
- **Role-Based Permissions**: Users can only access features based on their role
- **Company Isolation**: Users can only access their assigned company
- **Audit Logging**: All actions are logged for security tracking

### 3. **Data Protection**
- **Encrypted Storage**: Passwords are hashed using bcrypt
- **Session Management**: Secure session handling
- **Input Validation**: All inputs are validated and sanitized

## Usage Examples

### Example 1: Manager Invites New Recruiter

1. **Manager navigates to Team Management → Users tab**
2. **Clicks "Invite User" button**
3. **Fills in user details:**
   - Full Name: "Sarah Johnson"
   - Email: "sarah@company.com"
   - Phone: "+1555123456"
4. **Submits invitation**
5. **System creates account and shows credentials:**
   - Email: sarah@company.com
   - Password: a1b2c3d4
   - Login URL: https://app.company.com/login
6. **Manager shares credentials with Sarah**
7. **Sarah can immediately login and start working**

### Example 2: Bulk Team Onboarding

1. **Manager prepares CSV data:**
   ```
   John Smith, john@company.com, +1555111111
   Mary Wilson, mary@company.com, +1555222222
   Tom Brown, tom@company.com, +1555333333
   ```
2. **Uses "Bulk Invite" feature**
3. **System processes all users simultaneously**
4. **All users get recruiter role automatically**
5. **Manager receives credentials for all users**
6. **Team can start working immediately**

## Benefits

### For Managers
- **Streamlined Onboarding**: No need for email verification or complex setup
- **Immediate Productivity**: New team members can start working right away
- **Centralized Control**: Manage all team members from one interface
- **Flexible Permissions**: Customize access levels as needed

### For Team Members
- **Quick Access**: No waiting for email verification or approval
- **Clear Permissions**: Know exactly what they can and cannot do
- **Immediate Integration**: Access to company resources right away
- **Professional Setup**: Proper role assignment and team structure

### For Companies
- **Faster Scaling**: Add team members quickly during growth
- **Consistent Access**: Standardized permission structure
- **Better Security**: Controlled access to company resources
- **Improved Collaboration**: Team members can work together immediately

## Configuration

### Environment Variables
```bash
FRONTEND_URL=https://app.company.com  # Frontend application URL
```

### Default Settings
- **Auto-role Assignment**: Enabled by default
- **Default Role**: "Recruiter" with predefined permissions
- **Password Length**: 8 characters (cryptographically secure)
- **Invitation Expiry**: 7 days (for existing users)

## Troubleshooting

### Common Issues

1. **User Cannot Login**
   - Verify credentials were shared correctly
   - Check if user account is active
   - Ensure user is assigned to company

2. **Permissions Not Working**
   - Verify role assignment
   - Check role permissions
   - Ensure user is active in company

3. **Bulk Invite Failures**
   - Check data format (Name, Email, Phone)
   - Verify email addresses are valid
   - Check for duplicate users

### Support
For technical support or questions about the team management system, contact the development team or refer to the API documentation.

## Future Enhancements

### Planned Features
- **Email Notifications**: Automatic credential sharing via email
- **Password Reset**: Self-service password reset for users
- **Advanced Permissions**: More granular permission controls
- **Team Templates**: Pre-configured team structures
- **Analytics**: Team performance and usage metrics

### Integration Opportunities
- **HR Systems**: Integration with HR management platforms
- **SSO**: Single sign-on with company identity providers
- **Mobile App**: Native mobile application for team management
- **API Webhooks**: Real-time notifications for system events

---

This enhanced team management system provides a professional, secure, and efficient way for companies to manage their team members while maintaining proper access controls and security measures.
