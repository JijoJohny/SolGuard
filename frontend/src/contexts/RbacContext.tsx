import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchUserRoles } from '../store/slices/rbacSlice';

interface RbacContextType {
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    isLoading: boolean;
    error: string | null;
}

const RbacContext = createContext<RbacContextType | undefined>(undefined);

export const RbacProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    const { roles, isLoading, error } = useSelector((state: RootState) => state.rbac);
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        dispatch(fetchUserRoles());
    }, [dispatch]);

    useEffect(() => {
        // Fetch permissions for all roles
        const fetchPermissions = async () => {
            try {
                const allPermissions = await Promise.all(
                    roles.map(role => fetch(`/api/roles/${role.id}/permissions`).then(res => res.json()))
                );
                const uniquePermissions = [...new Set(allPermissions.flat())];
                setPermissions(uniquePermissions);
            } catch (err) {
                console.error('Error fetching permissions:', err);
            }
        };

        if (roles.length > 0) {
            fetchPermissions();
        }
    }, [roles]);

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasRole = (role: string): boolean => {
        return roles.some(r => r.name === role);
    };

    return (
        <RbacContext.Provider value={{ hasPermission, hasRole, isLoading, error }}>
            {children}
        </RbacContext.Provider>
    );
};

export const useRbac = () => {
    const context = useContext(RbacContext);
    if (context === undefined) {
        throw new Error('useRbac must be used within a RbacProvider');
    }
    return context;
}; 