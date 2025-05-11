import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useRbac } from '../../contexts/RbacContext';
import {
    fetchUserRoles,
    assignRole,
    removeRole,
    selectRoles,
} from '../../store/slices/rbacSlice';

interface UserRolesProps {
    userId: number;
}

export const UserRoles: React.FC<UserRolesProps> = ({ userId }) => {
    const dispatch = useDispatch();
    const { hasPermission } = useRbac();
    const roles = useSelector(selectRoles);
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        dispatch(fetchUserRoles());
        fetchAvailableRoles();
    }, [dispatch]);

    const fetchAvailableRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            setAvailableRoles(data);
        } catch (error) {
            console.error('Error fetching available roles:', error);
        }
    };

    const handleAddRole = async () => {
        if (selectedRole) {
            await dispatch(assignRole({ userId, roleId: parseInt(selectedRole) }));
            setOpenDialog(false);
            setSelectedRole('');
        }
    };

    const handleRemoveRole = async (roleId: number) => {
        await dispatch(removeRole({ userId, roleId }));
    };

    if (!hasPermission('manage_roles')) {
        return (
            <Box p={3}>
                <Typography color="error">
                    You don't have permission to manage roles.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">User Roles</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Add Role
                    </Button>
                </Box>

                <List>
                    {roles.map((role) => (
                        <ListItem key={role.id}>
                            <ListItemText
                                primary={role.name}
                                secondary={role.description}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleRemoveRole(role.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add Role</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            label="Role"
                        >
                            {availableRoles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddRole} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 