import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { CodeBlock } from './CodeBlock';

interface SecurityPattern {
  name: string;
  description: string;
  examples: string[];
  implementationGuide: string;
}

interface SecurityPatternCardProps {
  pattern: SecurityPattern;
}

export const SecurityPatternCard: React.FC<SecurityPatternCardProps> = ({ pattern }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {pattern.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {pattern.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Examples
          </Typography>
          <List>
            {pattern.examples.map((example, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <CodeBlock
                      code={example}
                      language="rust"
                      title={`Example ${index + 1}`}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Implementation Guide
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" paragraph>
              {pattern.implementationGuide}
            </Typography>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}; 