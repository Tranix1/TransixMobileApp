import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    getAdminPermissions,
    hasPermission,
    hasAnyPermission,
    canAccessAdminPanel,
    AdminUser,
    SUPER_ADMIN_PERMISSIONS
} from '@/Utilities/adminPermissions';

export const useAdminPermissions = () => {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadAdminPermissions();
        } else {
            setPermissions([]);
            setIsAdmin(false);
            setLoading(false);
        }
    }, [user?.uid]);

    const loadAdminPermissions = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const userPermissions = await getAdminPermissions(user.uid);
            const canAccess = await canAccessAdminPanel(user.uid);

            setPermissions(userPermissions);
            setIsAdmin(canAccess);
        } catch (error) {
            console.error('Error loading admin permissions:', error);
            setPermissions([]);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const checkPermission = async (permission: string): Promise<boolean> => {
        if (!user?.uid) return false;
        return hasPermission(user.uid, permission);
    };

    const checkAnyPermission = async (permissionsList: string[]): Promise<boolean> => {
        if (!user?.uid) return false;
        return hasAnyPermission(user.uid, permissionsList);
    };

    const hasPermissionSync = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasAnyPermissionSync = (permissionsList: string[]): boolean => {
        return permissionsList.some(permission => permissions.includes(permission));
    };

    const isSuperAdmin = (): boolean => {
        return user?.uid === 'QOC9krp5BOR7NhFXRuX5f32u17e2';
    };

    return {
        permissions,
        isAdmin,
        loading,
        checkPermission,
        checkAnyPermission,
        hasPermissionSync,
        hasAnyPermissionSync,
        isSuperAdmin,
        refreshPermissions: loadAdminPermissions
    };
};
