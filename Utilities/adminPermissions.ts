import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

export interface AdminRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

export interface AdminUser {
    userId: string;
    email: string;
    displayName?: string;
    roles: string[];
    permissions: string[];
    createdAt: string;
    isActive: boolean;
    expoPushToken?: string;
}

export const ADMIN_ROLES: AdminRole[] = [
    {
        id: 'approve_trucks',
        name: 'Approve Trucks',
        description: 'Can approve pending truck registrations',
        permissions: ['approve_trucks']
    },
    {
        id: 'add_tracking_agent',
        name: 'Add Tracking Agent',
        description: 'Can add users as tracking agents',
        permissions: ['add_tracking_agent']
    },
    {
        id: 'add_service_station_owner',
        name: 'Add Service Station Owner',
        description: 'Can add users as service station owners',
        permissions: ['add_service_station_owner']
    },
    {
        id: 'add_truck_stop_owner',
        name: 'Add Truck Stop Owner',
        description: 'Can add users as truck stop owners',
        permissions: ['add_truck_stop_owner']
    },
    {
        id: 'approve_loads',
        name: 'Approve Loads',
        description: 'Can approve pending load requests',
        permissions: ['approve_loads']
    },
    {
        id: 'approve_truck_accounts',
        name: 'Approve Truck Accounts',
        description: 'Can approve truck personal details',
        permissions: ['approve_truck_accounts']
    },
    {
        id: 'approve_loads_accounts',
        name: 'Approve Loads Accounts',
        description: 'Can approve load account details',
        permissions: ['approve_loads_accounts']
    },
    {
        id: 'manage_referrers',
        name: 'Manage Referrers',
        description: 'Can add and manage referrer codes',
        permissions: ['manage_referrers']
    },
    {
        id: 'version_management',
        name: 'Version Management',
        description: 'Can manage app versions and updates',
        permissions: ['version_management']
    }
];

export const SUPER_ADMIN_PERMISSIONS = [
    'approve_trucks',
    'add_tracking_agent',
    'add_service_station_owner',
    'add_truck_stop_owner',
    'approve_loads',
    'approve_truck_accounts',
    'approve_loads_accounts',
    'manage_referrers',
    'version_management',
    'add_admin',
    'manage_admins'
];

export const isSuperAdmin = (userId: string): boolean => {
    // Check if user is the main super admin
    return userId === 'QOC9krp5BOR7NhFXRuX5f32u17e2';
};

export const getAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
        const adminDoc = await getDoc(doc(db, 'adminRoles', userId));
        if (adminDoc.exists()) {
            return adminDoc.data() as AdminUser;
        }
        return null;
    } catch (error) {
        console.error('Error fetching admin user:', error);
        return null;
    }
};

export const hasPermission = async (userId: string, permission: string): Promise<boolean> => {
    // Super admin has all permissions
    if (isSuperAdmin(userId)) {
        return true;
    }

    try {
        const adminUser = await getAdminUser(userId);
        if (!adminUser || !adminUser.isActive) {
            return false;
        }

        return adminUser.permissions.includes(permission);
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

export const hasAnyPermission = async (userId: string, permissions: string[]): Promise<boolean> => {
    // Super admin has all permissions
    if (isSuperAdmin(userId)) {
        return true;
    }

    try {
        const adminUser = await getAdminUser(userId);
        if (!adminUser || !adminUser.isActive) {
            return false;
        }

        return permissions.some(permission => adminUser.permissions.includes(permission));
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
};

export const getAdminPermissions = async (userId: string): Promise<string[]> => {
    // Super admin has all permissions
    if (isSuperAdmin(userId)) {
        return SUPER_ADMIN_PERMISSIONS;
    }

    try {
        const adminUser = await getAdminUser(userId);
        if (!adminUser || !adminUser.isActive) {
            return [];
        }

        return adminUser.permissions;
    } catch (error) {
        console.error('Error getting admin permissions:', error);
        return [];
    }
};

export const canAccessAdminPanel = async (userId: string): Promise<boolean> => {
    return hasAnyPermission(userId, [
        'approve_trucks',
        'add_tracking_agent',
        'add_service_station_owner',
        'add_truck_stop_owner',
        'approve_loads',
        'approve_truck_accounts',
        'approve_loads_accounts',
        'manage_referrers',
        'version_management'
    ]);
};

/**
 * Update admin expoPushToken
 * @param userId - The admin user ID
 * @param expoPushToken - The new expo push token
 */
export const updateAdminExpoPushToken = async (userId: string, expoPushToken: string): Promise<boolean> => {
    try {
        const adminDocRef = doc(db, 'adminRoles', userId);
        await updateDoc(adminDocRef, {
            expoPushToken: expoPushToken,
            lastModifiedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating admin expoPushToken:', error);
        return false;
    }
};
