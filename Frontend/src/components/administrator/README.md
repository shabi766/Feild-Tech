# Administrator Panel

This directory contains the administrator panel components for the Alpha Project platform. The administrator panel provides system administrators with tools to manage the platform, review KYC requests, manage users, and configure system settings.

## Components

### AdministratorPanel.jsx
The main container component that manages the overall layout and tab switching between different administrative functions.

**Features:**
- Tab-based navigation between different admin sections
- URL query parameter support for direct navigation
- Responsive layout with sidebar navigation

### AdministratorSidebar.jsx
Navigation sidebar component that provides access to all administrative functions.

**Navigation Items:**
- Dashboard - Platform overview and analytics
- KYC Management - Review and manage KYC requests
- User Management - Manage user accounts and permissions
- Companies - Manage company accounts
- Job Management - Monitor and manage job postings
- Wallet System - Monitor wallet transactions
- Reports - Generate system reports
- Analytics - Advanced analytics and insights
- System Settings - Configure system parameters

### AdministratorStats.jsx
Dashboard component displaying platform statistics and analytics.

**Features:**
- Overview statistics cards
- User growth line chart
- User distribution doughnut chart
- KYC status doughnut chart
- System health information
- Recent activity log

### KYCManagement.jsx
Component for managing Know Your Customer (KYC) applications.

**Features:**
- Table view of all KYC requests
- Filtering by status (Pending, Approved, Rejected)
- Search functionality
- Detailed modal view for each request
- Approve/Reject actions for pending applications
- Status tracking and history

### UserManagement.jsx
Component for managing user accounts across the platform.

**Features:**
- Table view of all users
- Filtering by role and status
- Search functionality
- Detailed modal view for each user
- User activation/suspension/deletion actions
- Role management
- KYC status tracking

### SystemSettings.jsx
Component for configuring platform-wide settings.

**Settings Categories:**
- **General**: Site name, description, timezone, language, maintenance mode
- **Security**: Session timeout, login attempts, 2FA, password requirements, CAPTCHA
- **Email**: SMTP configuration, notifications, email verification
- **Payment**: Currency, transaction fees, minimum withdrawal, payment gateways
- **Integrations**: Cloudinary, AWS S3, Google Maps, reCAPTCHA

## Usage

### Accessing the Administrator Panel
The administrator panel is accessible at `/administrator` route and requires administrator role authentication.

### Navigation
- Use the sidebar to switch between different administrative functions
- Direct navigation via URL query parameters (e.g., `/administrator?tab=kyc`)
- Breadcrumb navigation for easy orientation

### Authentication
The administrator panel is protected by the `ProtectedRoute` component and requires:
- Valid user authentication
- Administrator role assignment
- Proper session management

## Technical Details

### Dependencies
- React 18+
- Framer Motion (for animations)
- Lucide React (for icons)
- React Chart.js 2 (for charts)
- Tailwind CSS (for styling)

### State Management
- Local component state for UI interactions
- Mock data for demonstration (to be replaced with API calls)
- URL state synchronization for navigation

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive sidebar navigation
- Touch-friendly interactions

## Future Enhancements

### API Integration
- Replace mock data with actual backend API calls
- Implement real-time updates for KYC requests
- Add WebSocket support for live notifications

### Additional Features
- Advanced reporting and analytics
- Bulk operations for user management
- Audit logging and activity tracking
- System monitoring and health checks
- Backup and restore functionality

### Security Enhancements
- Role-based access control (RBAC)
- Audit trail for all administrative actions
- Two-factor authentication for administrators
- IP whitelisting for admin access

## File Structure
```
administrator/
├── AdministratorPanel.jsx      # Main container
├── AdministratorSidebar.jsx    # Navigation sidebar
├── AdministratorStats.jsx      # Dashboard statistics
├── KYCManagement.jsx          # KYC request management
├── UserManagement.jsx         # User account management
├── SystemSettings.jsx         # System configuration
└── README.md                  # This documentation
```

## Contributing
When adding new features to the administrator panel:
1. Follow the existing component structure and naming conventions
2. Use consistent styling with Tailwind CSS
3. Implement proper error handling and loading states
4. Add appropriate TypeScript types if migrating to TypeScript
5. Update this README with new component documentation

