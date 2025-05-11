import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
    TextField,
    Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AuditLogList } from '../components/AuditLog/AuditLogList';
import { useRbac } from '../contexts/RbacContext';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`audit-tabpanel-${index}`}
            aria-labelledby={`audit-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export const AuditLogs: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [entityType, setEntityType] = useState('');
    const [entityId, setEntityId] = useState('');
    const { hasPermission } = useRbac();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (!hasPermission('view_audit_logs')) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography color="error">
                    You don't have permission to view audit logs.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="audit log tabs"
                    >
                        <Tab label="All Logs" />
                        <Tab label="User Activity" />
                        <Tab label="Project Activity" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Entity Type"
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Entity ID"
                                value={entityId}
                                onChange={(e) => setEntityId(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <AuditLogList
                        entityType={entityType || undefined}
                        entityId={entityId ? parseInt(entityId) : undefined}
                    />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <AuditLogList entityType="user" />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <AuditLogList entityType="project" />
                </TabPanel>
            </Paper>
        </Container>
    );
}; 