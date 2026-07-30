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
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

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

  


const isSuperAdmin = async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
        const adminDoc = await getDoc(doc(db, "adminRoles", user.uid));

        if (!adminDoc.exists()) return false;

        const data = adminDoc.data();

        return (
            data.role === "SUPER_ADMIN" &&
            data.isActive === true
        );
    } catch (error) {
        console.error("Error checking super admin:", error);
        return false;
    }
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
