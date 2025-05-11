import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Role {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface RbacState {
    roles: Role[];
    permissions: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: RbacState = {
    roles: [],
    permissions: [],
    isLoading: false,
    error: null,
};

export const fetchUserRoles = createAsyncThunk(
    'rbac/fetchUserRoles',
    async () => {
        const response = await fetch('/api/users/me/roles');
        if (!response.ok) {
            throw new Error('Failed to fetch user roles');
        }
        return response.json();
    }
);

export const fetchRolePermissions = createAsyncThunk(
    'rbac/fetchRolePermissions',
    async (roleId: number) => {
        const response = await fetch(`/api/roles/${roleId}/permissions`);
        if (!response.ok) {
            throw new Error('Failed to fetch role permissions');
        }
        return response.json();
    }
);

export const assignRole = createAsyncThunk(
    'rbac/assignRole',
    async ({ userId, roleId }: { userId: number; roleId: number }) => {
        const response = await fetch(`/api/users/${userId}/roles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role_id: roleId }),
        });
        if (!response.ok) {
            throw new Error('Failed to assign role');
        }
        return response.json();
    }
);

export const removeRole = createAsyncThunk(
    'rbac/removeRole',
    async ({ userId, roleId }: { userId: number; roleId: number }) => {
        const response = await fetch(`/api/users/${userId}/roles/${roleId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove role');
        }
        return { userId, roleId };
    }
);

const rbacSlice = createSlice({
    name: 'rbac',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch user roles
            .addCase(fetchUserRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload;
            })
            .addCase(fetchUserRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch user roles';
            })
            // Fetch role permissions
            .addCase(fetchRolePermissions.fulfilled, (state, action) => {
                state.permissions = action.payload;
            })
            // Assign role
            .addCase(assignRole.fulfilled, (state, action) => {
                state.roles.push(action.payload);
            })
            // Remove role
            .addCase(removeRole.fulfilled, (state, action) => {
                state.roles = state.roles.filter(
                    (role) => role.id !== action.payload.roleId
                );
            });
    },
});

export const { clearError } = rbacSlice.actions;

export const selectRoles = (state: RootState) => state.rbac.roles;
export const selectPermissions = (state: RootState) => state.rbac.permissions;
export const selectIsLoading = (state: RootState) => state.rbac.isLoading;
export const selectError = (state: RootState) => state.rbac.error;

export default rbacSlice.reducer; 