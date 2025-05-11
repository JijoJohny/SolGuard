import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Provider } from 'react-redux';
import { store } from './store';
import { theme } from './theme';
import { RbacProvider } from './contexts/RbacContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { AuditLogs } from './pages/AuditLogs';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';

export const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <RbacProvider>
                        <Router>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/"
                                    element={
                                        <PrivateRoute>
                                            <Layout />
                                        </PrivateRoute>
                                    }
                                >
                                    <Route index element={<Dashboard />} />
                                    <Route path="projects/:id" element={<ProjectDetail />} />
                                    <Route path="audit-logs" element={<AuditLogs />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="settings" element={<Settings />} />
                                </Route>
                            </Routes>
                        </Router>
                    </RbacProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </Provider>
    );
}; 