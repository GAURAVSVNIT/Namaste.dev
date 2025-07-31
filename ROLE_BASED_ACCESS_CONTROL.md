# Role-Based Access Control (RBAC) System

This document explains how to use the role-based access control system implemented in the Namaste.dev application.

## Overview

The RBAC system allows you to control access to different parts of your application based on user roles. Users can have one of three roles:

- **Member** (`member`) - Regular community member with basic access
- **Admin** (`admin`) - Full administrative access to all features  
- **Merchant** (`merchant`) - Access to merchant dashboard and product management

## Files Overview

### Core Files
- `src/lib/roles.js` - Role definitions, utilities, and constants
- `src/components/auth/RoleProtected.jsx` - Component wrapper for protecting routes
- `src/hooks/useRole.js` - Custom hook for role-based logic
- `src/app/unauthorized/page.jsx` - Page shown when access is denied

## Usage Examples

### 1. Protecting Routes with RoleProtected Component

```jsx
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

// Allow only merchants to access this page
export default function MerchantDashboard() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT]}>
      <div>Merchant Dashboard Content</div>
    </RoleProtected>
  );
}

// Allow both admins and merchants
export default function AdminMerchantPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MERCHANT]}>
      <div>Admin/Merchant Content</div>
    </RoleProtected>
  );
}
```

### 2. Using the useRole Hook

```jsx
import { useRole } from '@/hooks/useRole';

export default function MyComponent() {
  const { 
    user, 
    userRole, 
    loading, 
    isAdmin, 
    isMerchant, 
    canAccessMerchant 
  } = useRole();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Your role: {userRole}</p>
      
      {isAdmin() && (
        <button>Admin Only Action</button>
      )}
      
      {isMerchant() && (
        <button>Merchant Only Action</button>
      )}
      
      {canAccessMerchant() && (
        <button>Available to Merchants and Admins</button>
      )}
    </div>
  );
}
```

### 3. Role Utilities

```jsx
import { 
  USER_ROLES, 
  getRoleLabel, 
  getRoleColor, 
  getRoleIcon,
  isValidRole 
} from '@/lib/roles';

// Get role display information
const roleLabel = getRoleLabel('merchant'); // "Merchant"
const roleColor = getRoleColor('merchant'); // "bg-green-100 text-green-800"
const roleIcon = getRoleIcon('merchant'); // "🏪"

// Validate roles
const isValid = isValidRole('merchant'); // true
const isValid2 = isValidRole('invalid'); // false
```

## Setting User Roles

### Method 1: During User Registration

```jsx
import { createUser } from '@/lib/firebase';
import { USER_ROLES } from '@/lib/roles';

const handleRegistration = async (email, password, userData) => {
  try {
    await createUser(email, password, {
      ...userData,
      role: USER_ROLES.MERCHANT // Set role during registration
    });
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Method 2: Update Existing User Role

```jsx
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES } from '@/lib/roles';

const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
  }
};

// Usage
await updateUserRole('user123', USER_ROLES.MERCHANT);
```

## Advanced Usage

### Conditional Rendering Based on Multiple Roles

```jsx
import { useRole } from '@/hooks/useRole';
import { USER_ROLES } from '@/lib/roles';

export default function ConditionalComponent() {
  const { hasAnyRole } = useRole();

  const canManageProducts = hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.MERCHANT]);

  return (
    <div>
      {canManageProducts && (
        <ProductManagementSection />
      )}
    </div>
  );
}
```

### Custom Role Protection Component

```jsx
import { useRole } from '@/hooks/useRole';

const RoleGate = ({ allowedRoles, children, fallback = null }) => {
  const { hasAnyRole, loading } = useRole();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAnyRole(allowedRoles)) {
    return fallback;
  }

  return children;
};

// Usage
<RoleGate 
  allowedRoles={[USER_ROLES.ADMIN]} 
  fallback={<div>Admin access required</div>}
>
  <AdminPanel />
</RoleGate>
```

## Configuration Options

### RoleProtected Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `allowedRoles` | `string[]` | `[]` | Array of roles that can access the content |
| `children` | `ReactNode` | - | Content to show if user has access |
| `fallback` | `ReactNode` | `null` | Content to show while loading or if no access |
| `redirectTo` | `string` | `'/auth/login'` | Where to redirect unauthorized users |

### useRole Hook Return Values

| Property | Type | Description |
|----------|------|-------------|
| `user` | `object` | Full user object with profile data |
| `userRole` | `string` | Current user's role |
| `loading` | `boolean` | Whether role data is being fetched |
| `error` | `string` | Error message if role fetch failed |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `hasRole(role)` | `function` | Check if user has specific role |
| `hasAnyRole(roles[])` | `function` | Check if user has any of the specified roles |
| `isMember()` | `function` | Check if user is a member |
| `isAdmin()` | `function` | Check if user is an admin |
| `isMerchant()` | `function` | Check if user is a merchant |
| `canAccessMerchant()` | `function` | Check if user can access merchant features |
| `canAccessAdmin()` | `function` | Check if user can access admin features |

## Security Notes

1. **Client-side Only**: This system provides UI-level access control. Always implement server-side validation for sensitive operations.

2. **Role Validation**: User roles are stored in Firestore and validated on both client and server sides.

3. **Default Role**: If a user's role is invalid or missing, they default to the `member` role.

4. **Error Handling**: The system gracefully handles errors and provides fallback behavior.

## Troubleshooting

### Common Issues

1. **"User profile not found" Error**
   - Ensure user profiles are created in Firestore during registration
   - Check that the user document exists in the `users` collection

2. **Role Not Updating**
   - Make sure to update the `updated_at` timestamp when changing roles
   - Clear browser cache if role changes aren't reflected

3. **Access Denied for Valid Users**
   - Verify the role is spelled correctly in the database
   - Check that the role is included in the `allowedRoles` array

### Debugging

Enable detailed logging by checking the browser console for error messages from the role system.

## Example Implementation

The merchant dashboard (`src/app/merchant-dashboard/page.jsx`) demonstrates a complete implementation of role-based access control:

```jsx
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

export default function MerchantDashboardPage() {
  return (
    <RoleProtected allowedRoles={[USER_ROLES.MERCHANT]}>
      <MerchantDashboardContent />
    </RoleProtected>
  );
}
```

This ensures that only users with the `merchant` role can access the merchant dashboard, with automatic redirection to the login page for unauthenticated users and the unauthorized page for users without proper permissions.
