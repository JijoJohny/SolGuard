# SolGuard Frontend

The frontend application for SolGuard, a security analysis tool for Solana smart contracts.

## Features

- Real-time security analysis of Solana smart contracts
- Interactive code editor with syntax highlighting
- AI-powered code suggestions and improvements
- Vulnerability detection and reporting
- Project management and collaboration
- Custom security rules configuration
- CI/CD integration
- Advanced notifications system

## Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the environment variables in `.env` with your configuration.

## Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

Build the application for production:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

The application is configured for deployment on Vercel. The build process is handled automatically by Vercel's CI/CD pipeline.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── store/         # Redux store configuration
  ├── services/      # API and other services
  ├── utils/         # Utility functions
  ├── types/         # TypeScript type definitions
  ├── hooks/         # Custom React hooks
  ├── assets/        # Static assets
  └── App.tsx        # Root component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 