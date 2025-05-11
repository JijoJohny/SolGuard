# SolGuard - Solana Smart Contract Security Analyzer

SolGuard is a comprehensive security analysis tool for Solana smart contracts written in Rust. It provides static analysis, vulnerability detection, and security best practices enforcement.

## Features

- Static analysis of Solana smart contracts
- Vulnerability detection and reporting
- Security best practices enforcement
- Real-time analysis results
- Project management and collaboration
- User authentication and authorization
- API for integration with other tools

## Architecture

The project consists of three main components:

1. **Backend (Rust)**
   - Core static analysis engine
   - REST API endpoints
   - Database integration
   - Authentication and authorization

2. **Frontend (React)**
   - Modern, responsive UI
   - Real-time analysis results
   - Project management interface
   - User authentication

3. **Database (PostgreSQL)**
   - User data
   - Project information
   - Analysis results
   - Security rules

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Rust 1.75+ (for local development)
- PostgreSQL 14+ (for local development)
- Redis 7+ (for local development)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solguard.git
   cd solguard
   ```

2. Start the development environment:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432
   - Redis: localhost:6379

## Development

### Backend Development

1. Install Rust dependencies:
   ```bash
   cargo build
   ```

2. Run the backend server:
   ```bash
   cargo run
   ```

### Frontend Development

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

The API documentation is available at http://localhost:8080/api/docs when running the backend server.

### Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Main Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/analysis/analyze` - Run security analysis
- `GET /api/analysis/{id}` - Get analysis results
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

## Security Rules

SolGuard includes a comprehensive set of security rules for Solana smart contracts:

1. **Access Control**
   - Owner-only function checks
   - Proper authority validation
   - Role-based access control

2. **Input Validation**
   - Parameter bounds checking
   - Type validation
   - Input sanitization

3. **State Management**
   - Atomic operations
   - State consistency
   - Proper error handling

4. **Financial Security**
   - Balance checks
   - Overflow protection
   - Fee validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 