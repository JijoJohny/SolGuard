import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  analysisCount: number;
  vulnerabilityCount: number;
}

interface ProjectInfoProps {
  project: Project;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ project }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Description"
                  secondary={project.description}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Analysis Count"
                  secondary={`${project.analysisCount} analyses performed`}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Vulnerabilities"
                  secondary={`${project.vulnerabilityCount} vulnerabilities found`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={project.status}
                color={
                  project.status === 'Active'
                    ? 'success'
                    : project.status === 'In Progress'
                    ? 'warning'
                    : 'error'
                }
                sx={{ mb: 2 }}
              />
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <UpdateIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Created"
                  secondary={formatDate(project.createdAt)}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemIcon>
                  <UpdateIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Last Updated"
                  secondary={formatDate(project.updatedAt)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 