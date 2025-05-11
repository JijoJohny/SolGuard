# SolGuard Architecture

This document provides a detailed overview of the SolGuard project structure, explaining the purpose and responsibility of each component.

## Project Structure

```
solguard/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store configuration
│   │   ├── services/       # API and other services
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── assets/         # Static assets
│   │   ├── i18n/           # Internationalization (i18n) files
│   │   └── App.tsx         # Root component
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── .env               # Frontend environment variables
│
├── backend/                # Rust backend service
│   ├── src/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── scheduler/     # Scheduled analysis jobs
│   │   ├── rbac/          # Role-based access control logic
│   │   ├── audit/         # Audit log logic
│   │   ├── github/        # GitHub/GitLab integration
│   │   └── main.rs        # Application entry point
│   ├── Cargo.toml         # Rust dependencies
│   └── .env              # Backend environment variables
│
├── ai/                    # AI model integration
│   ├── models/           # AI model definitions
│   ├── training/         # Model training scripts
│   └── inference/        # Model inference code
│
├── migrations/           # Database migrations
│   ├── 20240101000001_initial.sql
│   ├── 20240101000002_add_features.sql
│   ├── 20240101000003_rbac.sql
│   ├── 20240101000004_audit_log.sql
│   ├── 20240101000005_schedules.sql
│   ├── 20240101000006_github_integration.sql
│   └── ...
│
├── config/              # Configuration files
│   ├── ai_models.json   # AI model configurations
│   └── nginx.conf      # Nginx configuration
│
├── docs/               # Documentation
│   ├── api/           # API documentation
│   └── guides/        # User guides
│
├── docker-compose.yml  # Docker services configuration
├── vercel.json        # Vercel deployment configuration
└── .env              # Root environment variables
```

## New Features & Integration Points

### 1. Role-Based Access Control (RBAC)
- **Backend:** `src/rbac/`, `migrations/20240101000003_rbac.sql`
  - Role and permission models, middleware for endpoint protection.
- **Frontend:** Redux/auth state, role-based UI rendering.

### 2. Audit Log & Activity Feed
- **Backend:** `src/audit/`, `migrations/20240101000004_audit_log.sql`
  - Log actions, API to fetch logs.
- **Frontend:** `components/ActivityFeed/`, `pages/ActivityFeed.tsx`

### 3. Automated Scheduled Analysis
- **Backend:** `src/scheduler/`, `migrations/20240101000005_schedules.sql`
  - Scheduler service, schedule management endpoints.
- **Frontend:** `components/ScheduleManager/`, `pages/Schedules.tsx`

### 4. GitHub/GitLab Integration
- **Backend:** `src/github/`, `migrations/20240101000006_github_integration.sql`
  - OAuth, webhook handlers, repo linking.
- **Frontend:** `components/RepoConnect/`, `pages/RepoIntegration.tsx`

### 5. Customizable Notification Channels
- **Backend:** Notification integrations in `src/services/notification.rs`.
- **Frontend:** `components/NotificationPreferences/`, notification settings UI.

### 6. Export Analysis Reports
- **Backend:** Export endpoints in `src/api/analysis.rs`.
- **Frontend:** Export button in `components/AnalysisReport/`.

### 7. AI-Powered Remediation Suggestions
- **Backend:** AI suggestion endpoint in `src/api/ai.rs`.
- **Frontend:** "Suggested Fix" in `components/AnalysisReport/`.

### 8. Multi-language Support (i18n)
- **Frontend:** `src/i18n/`, language switcher in UI.

### 9. Dark/Light Theme Toggle
- **Frontend:** Theme context/provider, toggle in UI header or settings.

### 10. API Rate Limiting and Abuse Protection
- **Backend:** Rate limiting middleware in `src/api/` or `src/middleware/`.

## Key Features Implementation (Updated)

### Real-time Analysis
- WebSocket connections for live updates
- Incremental analysis results
- Collaborative editing

### AI Integration
- Model serving infrastructure
- Inference optimization
- Result caching
- **Remediation suggestions**

### Security Rules
- Custom rule definition
- Rule validation
- Rule application

### Notifications
- Real-time delivery
- Multiple channels (email, in-app, Slack, Discord)
- Notification preferences

### RBAC & Audit
- Role-based permissions
- Audit log for all key actions
- Activity feed in UI

### Scheduled Analysis
- Cron-based or interval-based scheduling
- UI for managing schedules

### GitHub/GitLab Integration
- OAuth and webhook support
- Repo-linked analysis

### Exporting
- PDF/CSV/JSON export endpoints
- UI export options

### i18n & Theming
- Multi-language support
- Dark/light theme toggle

### API Protection
- Rate limiting middleware
- Abuse detection

## Development Guidelines (Updated)
- Extend Redux store and backend models for new features
- Use feature-based directory structure for scalability
- Add tests for new endpoints and UI components

## Monitoring and Maintenance (Updated)
- Log RBAC and audit events
- Monitor scheduled jobs
- Track integration/webhook errors
- Monitor rate limiting and abuse events

## Component Details

### Frontend (`frontend/`)

#### Components (`src/components/`)
- `AIAnalysis/`: AI-powered analysis components
- `CodeEditor/`: Smart contract code editor
- `Dashboard/`: Main dashboard components
- `Notifications/`: Notification system components
- `ProjectList/`: Project management components
- `SecurityRules/`: Security rules configuration
- `Settings/`: Application settings

#### Pages (`src/pages/`)
- `Login/`: Authentication page
- `Register/`: User registration
- `Dashboard/`: Main dashboard
- `ProjectDetail/`: Project details and analysis
- `Settings/`: User settings

#### Store (`src/store/`)
- `slices/`: Redux slices for state management
  - `authSlice.ts`: Authentication state
  - `projectSlice.ts`: Project management
  - `analysisSlice.ts`: Analysis results
  - `notificationSlice.ts`: Notifications

#### Services (`src/services/`)
- `api.ts`: API client configuration
- `auth.ts`: Authentication services
- `project.ts`: Project management
- `analysis.ts`: Analysis services
- `websocket.ts`: Real-time communication

### Backend (`backend/`)

#### API (`src/api/`)
- `routes/`: API endpoint definitions
- `middleware/`: Request middleware
- `handlers/`: Request handlers

#### Models (`src/models/`)
- `user.rs`: User model
- `project.rs`: Project model
- `analysis.rs`: Analysis model
- `notification.rs`: Notification model

#### Services (`src/services/`)
- `auth.rs`: Authentication logic
- `analysis.rs`: Analysis engine
- `notification.rs`: Notification system
- `websocket.rs`: WebSocket handling

### AI Integration (`ai/`)

#### Models (`models/`)
- `security_analyzer/`: Security analysis models
- `code_generator/`: Code generation models
- `vulnerability_detector/`: Vulnerability detection

#### Training (`training/`)
- `data_preparation/`: Data preprocessing
- `model_training/`: Training scripts
- `evaluation/`: Model evaluation

### Database (`migrations/`)

#### Schema
- Users and authentication
- Projects and analysis
- Security rules
- Notifications
- Collaboration sessions

### Configuration (`config/`)

#### AI Models (`ai_models.json`)
- Model configurations
- Parameters
- Input/output specifications

#### Nginx (`nginx.conf`)
- Reverse proxy settings
- SSL configuration
- Caching rules

## Key Features Implementation

### Real-time Analysis
- WebSocket connections for live updates
- Incremental analysis results
- Collaborative editing

### AI Integration
- Model serving infrastructure
- Inference optimization
- Result caching

### Security Rules
- Custom rule definition
- Rule validation
- Rule application

### Notifications
- Real-time delivery
- Multiple channels (email, in-app)
- Notification preferences

## Development Guidelines

### Code Organization
- Feature-based directory structure
- Clear separation of concerns
- Consistent naming conventions

### Testing Strategy
- Unit tests for components
- Integration tests for features
- End-to-end testing

### Performance Considerations
- Code splitting
- Lazy loading
- Caching strategies

### Security Measures
- Input validation
- Authentication
- Authorization
- Data encryption

## Deployment Architecture

### Frontend (Vercel)
- Static file serving
- Edge caching
- CDN distribution

### Backend (Cloud Provider)
- Container orchestration
- Load balancing
- Auto-scaling

### Database
- Primary/Replica setup
- Connection pooling
- Backup strategy

### AI Services
- Model serving
- Batch processing
- Result caching

## Monitoring and Maintenance

### Logging
- Application logs
- Error tracking
- Performance metrics

### Monitoring
- Service health
- Resource usage
- Error rates

### Maintenance
- Database migrations
- Model updates
- Security patches 
