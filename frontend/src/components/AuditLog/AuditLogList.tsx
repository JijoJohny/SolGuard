import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { Info as InfoIcon } from '@mui/icons-material';
import { useRbac } from '../../contexts/RbacContext';

interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    entity_type: string;
    entity_id: number | null;
    details: any;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

interface AuditLogListProps {
    entityType?: string;
    entityId?: number;
    userId?: number;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
    entityType,
    entityId,
    userId,
}) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const { hasPermission } = useRbac();

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage, entityType, entityId, userId]);

    const fetchLogs = async () => {
        try {
            let url = `/api/audit-logs?page=${page + 1}&limit=${rowsPerPage}`;
            if (entityType && entityId) {
                url += `&entity_type=${entityType}&entity_id=${entityId}`;
            }
            if (userId) {
                url += `&user_id=${userId}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            setLogs(data.logs);
            setTotalCount(data.total);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return 'success';
            case 'update':
                return 'info';
            case 'delete':
                return 'error';
            default:
                return 'default';
        }
    };

    if (!hasPermission('view_audit_logs')) {
        return (
            <Box p={3}>
                <Typography color="error">
                    You don't have permission to view audit logs.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Entity</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    {format(new Date(log.created_at), 'PPpp')}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.action}
                                        color={getActionColor(log.action) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {log.entity_type}
                                    {log.entity_id && ` #${log.entity_id}`}
                                </TableCell>
                                <TableCell>{log.user_id || 'System'}</TableCell>
                                <TableCell>{log.ip_address || '-'}</TableCell>
                                <TableCell>
                                    {log.details && (
                                        <Tooltip title={JSON.stringify(log.details, null, 2)}>
                                            <IconButton size="small">
                                                <InfoIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Box>
    );
}; 