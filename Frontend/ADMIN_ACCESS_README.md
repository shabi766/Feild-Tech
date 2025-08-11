# Administrator Access Guide

This document outlines the various ways to access administrator components in the application.

## 🚀 Quick Access Methods

### 1. **Direct URL Route**
Navigate directly to the administrator login page:
```
/admin-login
```

### 2. **Hidden Navbar Link**
Look for the subtle "Admin" link in the top navigation bar (appears as small, low-opacity text).

### 3. **Keyboard Shortcuts**
Use these keyboard combinations on the landing page:

- **Ctrl + Alt + A** - Shows admin access indicator
- **Konami Code**: ↑↑↓↓←→←→BA (Arrow keys + B + A)

### 4. **Visual Hints**
- **Footer**: Look for a very subtle "A" character in the footer (low opacity)
- **Development Mode**: In development, a small hint box appears in the bottom-left corner

## 🔐 Administrator Login

### Requirements
- User account must have `role: 'Admin'` in the database
- Valid email and password credentials

### Security Features
- **Account Lockout**: After 5 failed attempts, account is locked for 15 minutes
- **Role Verification**: Only users with Administrator role can access
- **Session Management**: 30-minute session timeout with activity monitoring
- **Audit Logging**: All administrative actions are logged

### Login Process
1. Navigate to `/admin-login`
2. Enter administrator credentials
3. System validates role and permissions
4. Redirects to `/administrator` panel on success

## 🎛️ Administrator Panel

### Access URL
```
/administrator
```

### Available Components
- **Dashboard** (`/administrator?tab=dashboard`) - Platform overview and analytics
- **KYC Management** (`/administrator?tab=kyc`) - Review and manage KYC requests
- **User Management** (`/administrator?tab=users`) - Manage user accounts and permissions
- **System Settings** (`/administrator?tab=settings`) - Configure system parameters
- **Audit Logs** (`/administrator?tab=audit`) - View system activity and administrative actions

## 🛡️ Security Considerations

### Access Control
- Strict role-based access control
- Session timeout protection
- Failed attempt monitoring
- Account lockout mechanism

### Best Practices
- Use strong, unique passwords
- Don't share administrator credentials
- Log out when finished
- Monitor audit logs regularly
- Use HTTPS in production

## 🔧 Development Notes

### Environment Variables
- Development mode shows additional access hints
- Production mode hides all access hints for security

### Testing
- Create test administrator accounts for development
- Use role-based testing scenarios
- Verify all security features work correctly

## 📱 Mobile Access

The administrator panel is fully responsive and accessible on mobile devices, though some features may be optimized for desktop use.

## 🆘 Troubleshooting

### Common Issues
1. **Access Denied**: Verify user role is 'Administrator'
2. **Account Locked**: Wait 15 minutes or contact system administrator
3. **Session Expired**: Re-login after 30 minutes of inactivity
4. **Route Not Found**: Ensure you're using the correct URL paths

### Support
For administrator access issues, contact the system administrator or development team.

---

**Note**: This guide is for authorized personnel only. Keep administrator access methods confidential to maintain system security.
