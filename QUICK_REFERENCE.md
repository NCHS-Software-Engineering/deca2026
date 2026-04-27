# Quick Reference: Account Hierarchy System

## 🚀 Quick Start

### Import the utilities you need:
```javascript
import { 
  isSponsor, 
  isTeacher, 
  getCurrentUser,
  hasFeature 
} from './utils/roleUtils';
```

---

## ✅ Common Use Cases

### 1. Show component only to sponsors
```jsx
{isSponsor() && <SponsorOnlyFeature />}
```

### 2. Protect a route for sponsors
```jsx
<ProtectedRouteRole requiredRole={ROLES.SPONSOR}>
  <AdminPanel />
</ProtectedRouteRole>
```

### 3. Show different content based on role
```jsx
<SponsorContent>
  <PremiumFeature />
</SponsorContent>
```

### 4. Get current user info
```jsx
const user = getCurrentUser();
console.log(user.role, user.name, user.email);
```

### 5. Check if user can do something
```jsx
if (hasFeature('canExportData')) {
  // show export button
}
```

---

## 🔐 Role Hierarchy (Bottom to Top)

```
        👑 SPONSOR (Full Access)
             ↑
        📚 TEACHER (Can Manage)
             ↑
        👤 STUDENT (Basic Access)
```

---

## 📋 What Each Role Can Do

### Student (👤)
- Learn and practice
- Track personal progress
- View stats

### Teacher (📚)
- ✓ Everything students can do
- ✓ Manage students
- ✓ Edit content (PIs)
- ✓ View analytics

### Sponsor (👑)
- ✓ Everything teachers can do
- ✓ Access sponsor-only content
- ✓ Export data
- ✓ Manage user roles
- ✓ Advanced features

---

## 🎯 Most Common Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `isSponsor()` | Check if user is sponsor | `{isSponsor() && <btn/>}` |
| `isTeacher()` | Check if user is teacher | `if (isTeacher())` |
| `isStudent()` | Check if user is student | `if (isStudent())` |
| `getCurrentUser()` | Get user object | `user = getCurrentUser()` |
| `hasFeature(name)` | Check if feature available | `if (hasFeature('canExport'))` |
| `hasPermissionLevel(role)` | Check role hierarchy | `if (hasPermissionLevel('teacher'))` |

---

## 🔌 API Endpoints

### Check if sponsor
```
GET /api/user/is-sponsor?googleId=USER_ID
```

### Get user role info
```
GET /api/user/role?googleId=USER_ID
```

### Change user role (admin)
```
POST /api/user/update-role
{
  "googleId": "USER_ID",
  "newRole": "sponsor"
}
```

### Get sponsor data (sponsors only)
```
GET /api/sponsor/restricted-content?googleId=USER_ID
```

---

## 📁 Files to Know

| File | Purpose |
|------|---------|
| `utils/roleUtils.js` | All utility functions |
| `components/ProtectedRouteRole.jsx` | Role-based route protection |
| `components/SponsorContent.jsx` | Show/hide sponsor content |
| `pages/profile/profile.jsx` | Shows user's account tier |
| `Server/server.js` | Backend role endpoints |

---

## 💡 Pro Tips

1. **Always check role on backend** for sensitive data
2. **Use `hasFeature()` for UI** - it's more flexible than checking specific roles
3. **Import functions at top** of your component
4. **Test with different roles** before deploying
5. **Clear localStorage** if role changes don't show up

---

## 🐛 Debugging

### Check current user:
```javascript
console.log(getCurrentUser());
```

### Check what features available:
```javascript
import { getRoleFeatures } from './utils/roleUtils';
const features = getRoleFeatures(getCurrentUser().role);
console.log(features);
```

### Test role check:
```javascript
console.log('Is sponsor:', isSponsor());
console.log('Is teacher:', isTeacher());
console.log('User role:', getCurrentUser().role);
```

---

## 📚 See Also

- Full documentation: `ACCOUNT_HIERARCHY_DOCS.md`
- Example implementation: `components/SponsorExample.jsx`
- Role utilities: `utils/roleUtils.js`
