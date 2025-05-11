import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRbac } from '../contexts/RbacContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
    children,
    requiredPermission,
}) => {
    const location = useLocation();
    const { hasPermission } = useRbac();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
            </div>
        );
    }

    return <>{children}</>;
}; 