import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, title }) => {
  return (
    <Box sx={{ mb: 2 }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 4,
            fontSize: '0.875rem',
          }}
          showLineNumbers
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      </Paper>
    </Box>
  );
}; 