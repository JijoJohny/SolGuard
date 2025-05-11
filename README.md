# SolGuard

SolGuard is a comprehensive security analysis tool for Solana smart contracts, providing real-time analysis, AI-powered suggestions, and advanced collaboration features.

## Features

- **Smart Contract Analysis**: Real-time security analysis of Solana smart contracts
- **AI Integration**: AI-powered code suggestions and improvements
- **Vulnerability Detection**: Advanced vulnerability detection and reporting
- **Project Management**: Comprehensive project management and collaboration tools
- **Custom Rules**: Configurable security rules and patterns
- **CI/CD Integration**: Seamless integration with CI/CD pipelines
- **Real-time Collaboration**: Multi-user collaboration with real-time updates
- **Advanced Notifications**: Configurable notification system for security alerts

## Prerequisites

### System Requirements
- Node.js >= 14.0.0
- Rust >= 1.70.0
- PostgreSQL >= 13.0
- Docker and Docker Compose
- Git

### Development Tools
- VS Code (recommended) with extensions:
  - Rust Analyzer
  - ESLint
  - Prettier
  - Docker
- Postman (for API testing)
- pgAdmin (for database management)

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/solguard.git
   cd solguard
   ```

2. **Environment Setup**
   ```bash
   # Create environment files
   touch .env
   cd solguard/frontend
   touch .env
   cd ../..
   ```

3. **Configure Environment Variables**
   
   In root `.env`:
   ```
   # Frontend Environment Variables
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000
   REACT_APP_ENV=development
   REACT_APP_VERSION=0.1.0

   # Backend Environment Variables
   RUST_ENV=development
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/solguard
   REDIS_URL=redis://localhost:6379

   # Database Configuration
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=solguard
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

   In `solguard/frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000
   REACT_APP_ENV=development
   ```

4. **Install Dependencies**

   Frontend:
   ```bash
   cd solguard/frontend
   npm install
   cd ../..
   ```

   Backend:
   ```bash
   cd solguard/backend
   cargo build
   cd ../..
   ```

5. **Database Setup**
   ```bash
   # Start PostgreSQL
   # Windows: Start PostgreSQL service
   # Linux/Mac:
   sudo service postgresql start

   # Create database
   createdb solguard
   ```

## Running the Application

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Running Services Individually

Frontend:
```bash
cd solguard/frontend
npm start
```

Backend:
```bash
cd solguard/backend
cargo run
```

## Development

### Project Structure
See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed project structure and file purposes.

### Development Workflow
1. Create a new branch for your feature
2. Make changes and test locally
3. Run tests before committing
4. Create a pull request

### Testing
```bash
# Frontend tests
cd solguard/frontend
npm test

# Backend tests
cd solguard/backend
cargo test
```

## Deployment

### Frontend Deployment (Vercel)
```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### Backend Deployment
```bash
# Build Docker image
docker build -t solguard-backend .

# Deploy to your preferred cloud provider
```

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Check if backend is running
   - Verify REACT_APP_API_URL in frontend .env
   - Check CORS settings

2. **Database connection fails**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

3. **Docker services fail to start**
   - Check Docker logs: `docker-compose logs`
   - Verify port availability
   - Check Docker daemon status

### Getting Help
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation
- Open an issue in the GitHub repository
- Contact the maintainers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

For support, please:
1. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) documentation
2. Open an issue in the GitHub repository
3. Contact the maintainers 
