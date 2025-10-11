import { auth } from '@/db/fireBaseConfig';
import { addDocument, updateDocument } from '@/db/operations';

export interface AdminAction {
    id?: string;
    adminId: string;
    adminEmail: string;
    adminName?: string;
    action: string;
    targetType: 'truck' | 'user' | 'load' | 'account' | 'admin';
    targetId: string;
    targetName?: string;
    details?: string;
    timestamp: string;
    previousData?: any;
    newData?: any;
}

export interface AdminActionLog {
    id: string;
    adminId: string;
    adminEmail: string;
    adminName?: string;
    action: string;
    targetType: string;
    targetId: string;
    targetName?: string;
    details?: string;
    timestamp: string;
    previousData?: any;
    newData?: any;
}

/**
 * Get current admin user information
 */
export const getCurrentAdminInfo = () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('No authenticated user found');
    }

    return {
        adminId: user.uid,
        adminEmail: user.email || 'unknown@example.com',
        adminName: user.displayName || 'Admin User'
    };
};

/**
 * Log an admin action to the database
 */
export const logAdminAction = async (actionData: Omit<AdminAction, 'id' | 'timestamp'>) => {
    try {
        const adminInfo = getCurrentAdminInfo();

        const logData: Omit<AdminActionLog, 'id'> = {
            ...actionData,
            adminId: adminInfo.adminId,
            adminEmail: adminInfo.adminEmail,
            adminName: adminInfo.adminName,
            timestamp: new Date().toISOString()
        };

        const logId = await addDocument('adminActionLogs', logData);
        console.log(`Admin action logged: ${actionData.action} by ${adminInfo.adminEmail}`);

        return logId;
    } catch (error) {
        console.error('Error logging admin action:', error);
        throw error;
    }
};

/**
 * Update a document with admin tracking
 */
export const updateDocumentWithAdminTracking = async (
    collectionName: string,
    docId: string,
    data: object,
    action: string,
    targetType: AdminAction['targetType'],
    targetName?: string,
    details?: string,
    previousData?: any
) => {
    try {
        // Update the document
        await updateDocument(collectionName, docId, {
            ...data,
            lastModifiedBy: getCurrentAdminInfo().adminId,
            lastModifiedByEmail: getCurrentAdminInfo().adminEmail,
            lastModifiedAt: new Date().toISOString()
        });

        // Log the admin action
        await logAdminAction({
            action,
            targetType,
            targetId: docId,
            targetName,
            details,
            previousData,
            newData: data
        });

        return true;
    } catch (error) {
        console.error('Error updating document with admin tracking:', error);
        throw error;
    }
};

/**
 * Common admin actions
 */
export const ADMIN_ACTIONS = {
    APPROVE_TRUCK: 'approve_truck',
    DECLINE_TRUCK: 'decline_truck',
    APPROVE_USER: 'approve_user',
    DECLINE_USER: 'decline_user',
    ASSIGN_USER: 'assign_user',
    UNASSIGN_USER: 'unassign_user',
    EDIT_TRUCK: 'edit_truck',
    EDIT_USER: 'edit_user',
    DELETE_TRUCK: 'delete_truck',
    DELETE_USER: 'delete_user',
    ADD_ADMIN: 'add_admin',
    REMOVE_ADMIN: 'remove_admin',
    UPDATE_PERMISSIONS: 'update_permissions',
    APPROVE_LOAD: 'approve_load',
    DECLINE_LOAD: 'decline_load',
    EDIT_LOAD: 'edit_load',
    DELETE_LOAD: 'delete_load'
} as const;

/**
 * Get admin action logs for a specific admin
 */
export const getAdminActionLogs = async (adminId?: string, limit: number = 50) => {
    try {
        const { fetchDocuments } = await import('@/db/operations');
        const { where, orderBy } = await import('firebase/firestore');

        const filters = adminId ? [where('adminId', '==', adminId)] : [];
        const result = await fetchDocuments('adminActionLogs', limit, undefined, [
            ...filters,
            orderBy('timestamp', 'desc')
        ]);

        return result.data || [];
    } catch (error) {
        console.error('Error fetching admin action logs:', error);
        throw error;
    }
};

/**
 * Get admin action logs for a specific target
 */
export const getTargetActionLogs = async (targetType: string, targetId: string, limit: number = 50) => {
    try {
        const { fetchDocuments } = await import('@/db/operations');
        const { where, orderBy } = await import('firebase/firestore');

        const result = await fetchDocuments('adminActionLogs', limit, undefined, [
            where('targetType', '==', targetType),
            where('targetId', '==', targetId),
            orderBy('timestamp', 'desc')
        ]);

        return result.data || [];
    } catch (error) {
        console.error('Error fetching target action logs:', error);
        throw error;
    }
};
