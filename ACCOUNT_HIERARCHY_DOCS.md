# Account Hierarchy & Sponsor System Documentation

## Overview

A complete role-based access control (RBAC) system has been implemented to support an account hierarchy with three tiers: **Sponsor**, **Teacher**, and **Student**. This system allows you to restrict access to sensitive features and data based on user roles.

## Account Hierarchy Levels

### 👑 Sponsor (Highest Level)
- **Full access** to all features and restricted content
- Can view and manage all users
- Can edit performance indicators
- Access to advanced analytics and data export
- Can manage roles and account settings
- Exclusive restricted content access

**Examples:** Event sponsors, system administrators, premium members

### 📚 Teacher (Mid Level)
- Can manage students and their progress
- Can edit performance indicators
- Access to analytics and reports
- Can view teacher dashboard
- **Cannot** access sponsor-exclusive content
- **Cannot** export data

**Examples:** Teachers, instructors, administrators

### 👤 Student (Base Level)
- Basic access to learning features
- Can view personal progress and stats
- **Cannot** access management features
- **Cannot** view analytics
- **Cannot** access restricted content

**Examples:** Students, regular members

---

## How to Use the Hierarchy System

### 1. **Automatic Role Assignment (Profile.jsx)**

Roles are automatically assigned based on email domain:
```javascript
// From profile.jsx
let role = "student"; // default
if (
  userObject.email.endsWith("@naperville203.org") &&
  !userObject.email.endsWith("@stu.naperville203.org")
) {
  role = "teacher"; // teachers in the district
}
// Sponsors must be manually upgraded via API
```

To make a user a sponsor, use the API endpoint:
```bash
POST /api/user/update-role
Body: {
  "googleId": "user_google_id",
  "newRole": "sponsor"
}
```

### 2. **Check User Role (roleUtils.js)**

Import and use these utility functions:

```javascript
import { 
  isSponsor, 
  isTeacher, 
  isStudent,
  hasRole,
  hasPermissionLevel,
  getCurrentUser,
  getRoleFeatures,
  hasFeature 
} from './utils/roleUtils';

// Check specific role
if (isSponsor()) {
  console.log("User is a sponsor");
}

// Check permission level (hierarchical)
if (hasPermissionLevel('sponsor')) {
  console.log("User has sponsor level or higher");
}

// Check for specific feature
if (hasFeature('canViewRestrictedContent')) {
  console.log("User can access restricted content");
}

// Get current user
const user = getCurrentUser();
```

### 3. **Protected Routes by Role (ProtectedRouteRole.jsx)**

Wrap routes to restrict access by role:

```javascript
import ProtectedRouteRole from './components/ProtectedRouteRole';
import { ROLES } from './utils/roleUtils';

// Only sponsors can access
<ProtectedRouteRole requiredRole={ROLES.SPONSOR}>
  <SponsorDashboard />
</ProtectedRouteRole>

// Only teachers and sponsors can access
<ProtectedRouteRole requiredRole={ROLES.TEACHER}>
  <TeacherPanel />
</ProtectedRouteRole>

// Everyone can access (but must be logged in)
<ProtectedRoute>
  <MainApp />
</ProtectedRoute>
```

### 4. **Hide/Show Sponsor-Only Content (SponsorContent.jsx)**

Display content conditionally based on role:

```javascript
import SponsorContent from './components/SponsorContent';

// Show different content to sponsors vs others
<SponsorContent
  featureName="canViewRestrictedContent"
  fallback={<div>Upgrade to Sponsor to access this</div>}
>
  <div>This is sponsor-only content</div>
</SponsorContent>

// With default fallback
<SponsorContent>
  <ExclusiveFeature />
</SponsorContent>
```

### 5. **Display Role Features (Profile Page)**

The profile page automatically displays:
- Current account tier with badge
- Available features for that tier
- Visual indicators of sponsor status

---

## Features by Role

### Available Features Matrix

| Feature | Student | Teacher | Sponsor |
|---------|---------|---------|---------|
| Basic Learning | ✓ | ✓ | ✓ |
| View Personal Stats | ✓ | ✓ | ✓ |
| View Analytics | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✓ | ✓ |
| Edit PIs | ✗ | ✓ | ✓ |
| View Restricted Content | ✗ | ✗ | ✓ |
| Export Data | ✗ | ✗ | ✓ |
| Manage Roles | ✗ | ✗ | ✓ |

---

## API Endpoints

### Authentication & Role Info

**Check if user is sponsor:**
```
GET /api/user/is-sponsor?googleId=USER_ID

Response:
{
  "isSponsor": true,
  "role": "sponsor"
}
```

**Get user role and features:**
```
GET /api/user/role?googleId=USER_ID

Response:
{
  "google_id": "...",
  "name": "...",
  "email": "...",
  "role": "sponsor",
  "features": {
    "name": "Sponsor Account",
    "canViewRestrictedContent": true,
    "canAccessAnalytics": true,
    ...
  }
}
```

### Role Management

**Update user role (Admin/Sponsor only):**
```
POST /api/user/update-role
Body: {
  "googleId": "USER_ID",
  "newRole": "sponsor" // or "teacher", "student"
}

Response:
{
  "message": "User role updated successfully",
  "user": { ... }
}
```

### Sponsor-Exclusive Data

**Get sponsor-only content:**
```
GET /api/sponsor/restricted-content?googleId=USER_ID

Response (Sponsor only):
{
  "message": "Sponsor restricted content",
  "accessLevel": "sponsor",
  "restrictedFeatures": {
    "advancedAnalytics": true,
    "userManagement": true,
    "dataExport": true,
    ...
  }
}

Response (Non-Sponsor):
{
  "error": "Access denied. Sponsor account required."
}
```

**Get all users (Sponsor only):**
```
GET /api/sponsor/all-users?googleId=USER_ID

Response:
{
  "users": [
    {
      "google_id": "...",
      "name": "...",
      "email": "...",
      "role": "sponsor"
    },
    ...
  ],
  "count": 15
}
```

---

## Implementation Examples

### Example 1: Simple Role Check
```javascript
import { isSponsor } from './utils/roleUtils';

function MyComponent() {
  return (
    <>
      <h1>Welcome</h1>
      {isSponsor() && <div>Sponsor exclusive button</div>}
    </>
  );
}
```

### Example 2: Permission Level Check
```javascript
import { hasPermissionLevel, ROLES } from './utils/roleUtils';

function AnalyticsDashboard() {
  if (!hasPermissionLevel(ROLES.TEACHER)) {
    return <div>Access Denied</div>;
  }
  return <Dashboard />;
}
```

### Example 3: Feature-Based Access
```javascript
import { hasFeature } from './utils/roleUtils';

function DataExport() {
  if (!hasFeature('canExportData')) {
    return <div>Feature not available for your account</div>;
  }
  return <ExportButton />;
}
```

### Example 4: Conditional Component Rendering
```javascript
import { getCurrentUser, getRoleFeatures } from './utils/roleUtils';

function ProfileCard() {
  const user = getCurrentUser();
  const features = getRoleFeatures(user.role);

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Account Type: {features.name}</p>
      {features.canAccessAnalytics && <AnalyticsLink />}
      {features.canExportData && <ExportLink />}
    </div>
  );
}
```

---

## Database Schema

The system stores role information in the existing `Users` table:

```sql
CREATE TABLE Users (
  google_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  picture_url VARCHAR(500),
  role ENUM('student', 'teacher', 'sponsor') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Security Considerations

1. **Always verify role on the backend** - Never trust client-side role claims for sensitive operations
2. **Use role-based API access** - Endpoints check user's role before returning restricted data
3. **Update roles through secure endpoints** - Role changes should require authentication/authorization
4. **Audit role changes** - Log all role promotion/demotion for compliance

### Backend Protection Example:
```javascript
// Server should always verify before granting access
app.get('/api/sponsor/restricted-content', async (req, res) => {
  const { googleId } = req.query;
  
  // Check if user is actually a sponsor
  const [user] = await pool.query(
    'SELECT role FROM Users WHERE google_id = ?',
    [googleId]
  );
  
  if (user[0].role !== 'sponsor') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Return restricted data
  return res.json({ ... });
});
```

---

## Best Practices

1. **Always check permissions before showing UI elements:**
   ```javascript
   {isSponsor() && <AdminPanel />}
   ```

2. **Use ProtectedRouteRole for sensitive pages:**
   ```javascript
   <ProtectedRouteRole requiredRole={ROLES.SPONSOR}>
     <AdminPage />
   </ProtectedRouteRole>
   ```

3. **Implement graceful fallbacks:**
   ```javascript
   <SponsorContent fallback={<UpgradePrompt />}>
     <FeatureName />
   </SponsorContent>
   ```

4. **Verify roles on backend for API calls**

5. **Keep role definitions in `roleUtils.js` centralized**

6. **Use meaningful role names that reflect your business**

---

## Extending the System

### Adding New Roles
Update `roleUtils.js`:
```javascript
export const ROLES = {
  ADMIN: 'admin',
  SPONSOR: 'sponsor',
  TEACHER: 'teacher',
  STUDENT: 'student'
};
```

### Adding New Features
Update `getRoleFeatures()`:
```javascript
'sponsor': {
  canCustomBranding: true,
  canAPIAccess: true,
  // new feature
}
```

### Custom Role Checks
Create new utility functions:
```javascript
export const isAdmin = () => hasRole(ROLES.ADMIN);
export const canExportReports = () => hasFeature('canExportReports');
```

---

## Files Modified/Created

### New Files
- `src/utils/roleUtils.js` - Role utilities and permission checks
- `src/components/ProtectedRouteRole.jsx` - Role-based route protection
- `src/components/SponsorContent.jsx` - Conditional sponsor content display
- `src/components/SponsorContent.css` - Styling for restricted content
- `src/components/SponsorExample.jsx` - Example implementation guide
- `src/components/SponsorExample.css` - Example styling

### Modified Files
- `src/pages/profile/profile.jsx` - Added role display and features list
- `src/pages/profile/profile.css` - Added account tier styling
- `src/Server/server.js` - Added role management endpoints

---

## Support & Troubleshooting

**User not showing as sponsor after role update?**
- Clear browser localStorage and reload
- Verify database update went through
- Check server logs for errors

**ProtectedRouteRole not working?**
- Ensure user is logged in (deca_unlocked in sessionStorage)
- Check browser console for permission check logs
- Verify user object is in localStorage with role property

**Features not available even though role is correct?**
- Check feature name matches exactly in `getRoleFeatures()`
- Verify using `hasFeature()` function
- Clear browser cache and reload

---

For questions or issues, refer to the example implementation in `SponsorExample.jsx`.
