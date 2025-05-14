# Property Reservation Management System

## 1. Project Overview

The Property Reservation Management Backend is a comprehensive system designed to manage property reservations, user accounts, and property information. The application integrates with the WeBook API for property and reservation management and offers features such as authentication, property listing, reservation tracking, and notification services.

## 2. Technology Stack

### 2.1 Core Technologies
- **Backend Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Services**: SMTP integration
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### 2.2 Key Dependencies
- Express.js - Web server framework
- Mongoose - MongoDB object modeling
- bcrypt - Password hashing
- jsonwebtoken - JWT implementation
- http-status-codes - HTTP status codes utility
- cors - Cross-Origin Resource Sharing middleware
- dotenv - Environment variable management
- Firebase Admin SDK - Push notifications

## 3. System Architecture

### 3.1 Project Structure
The application follows a modular architecture with separation of concerns:

```
src/
├── app/                       # Core application code
│   ├── builder/               # Query builders
│   ├── middlewares/           # Express middlewares
│   └── modules/               # Feature modules (users, properties, auth)
├── config/                    # Configuration settings
├── DB/                        # Database setup and initialization
├── enums/                     # Enumerations for consistent typing
├── errors/                    # Error handling utilities
├── helpers/                   # Helper functions
├── routes/                    # API routes definition
├── shared/                    # Shared utilities
├── types/                     # TypeScript type definitions
├── util/                      # Utility functions
├── app.ts                     # Express application setup
└── server.ts                  # Server entry point
```

### 3.2 Core Modules
- **Auth Module**: Manages user authentication, password reset, and session management
- **User Module**: Handles user account management and profiles
- **Property Module**: Manages properties, reservations, and room information
- **Reset Token Module**: Handles password reset functionality

## 4. Features and Functionality

### 4.1 Authentication System
- JWT-based authentication with access and refresh tokens
- Password encryption using bcrypt
- Password reset functionality with email notifications
- Role-based access control (Admin and User roles)

### 4.2 User Management
- User registration and profile management
- Role-based permissions
- Account verification via email

### 4.3 Property Management
- Property listing and details
- Integration with WeBook API for room information
- Property assignment to users/owners

### 4.4 Reservation System
- Reservation tracking and management
- Date-based filtering for reservations (arrival/departure dates)
- Reservation status updates
- Customer information integration

### 4.5 Notification System
- Email notifications for various events
- Push notifications using Firebase Cloud Messaging (FCM)
- Webhook handlers for external events


## 5. API Endpoints

### 5.1 Authentication Endpoints
- POST `/api/v1/auth/login` - User login
- POST `/api/v1/auth/reset-password` - Request password reset
- POST `/api/v1/auth/change-password` - Change password

### 5.2 User Endpoints
- GET `/api/v1/user` - Get user information
- PATCH `/api/v1/user` - Update user profile
- Various user management endpoints for admins

### 5.3 Property Endpoints
- POST `/api/v1/property` - Create property (admin only)
- GET `/api/v1/property` - Get all properties (admin only)
- GET `/api/v1/property/reservation/owner/:ownerId` - Get reservations by owner
- Additional endpoints for property and reservation management

### 5.4 Webhook Endpoints
- POST `/api/v1/new-reservation-added-hook` - Handle new reservation notifications
- POST `/api/v1/reservation-status-change-hook` - Handle reservation status changes

## 6. External Integrations

### 6.1 WeBook API
The system integrates with the WeBook API for:
- Fetching room information
- Managing reservations
- Customer data retrieval
- Note management

### 6.2 Firebase
- Firebase Admin SDK for push notifications
- Real-time alerts for reservation changes and new bookings


## 7. Data Models

### 7.1 User Model
```typescript
{
  role: USER_ROLES;           // "admin" or "user"
  name: string;
  email: string;
  password: string;
  image: string;
  phone?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  property?: string[];        // Associated properties
  fcmToken?: string;          // Firebase Cloud Messaging token
}
```

### 7.2 Property Model
```typescript
{
  owner: Types.ObjectId;      // Reference to User
  zakRoomId: string;          // External room ID from WeBook
  roomName: string;           // Room name
}
```

### 7.3 Reservation Data
```typescript
{
  id: number;
  id_human: string;
  booker: number;
  status: string;
  expiration_date: string;
  origin: {
    channel: string;
  };
  last_status_date: string;
  board: string;
  created: string;
  // Additional fields...
}
```

## 8. Security Features

### 8.1 Authentication Security
- Password hashing with bcrypt
- JWT-based authentication
- Token expiration and refresh mechanisms

### 8.2 API Security
- Role-based access control
- Request validation with middleware
- Error handling for security exceptions

### 8.3 Environment Variables
- Sensitive configuration stored in environment variables
- API keys and secrets protection

## 9. Development and Deployment

### 9.1 Development Environment
- Node.js development environment
- TypeScript for type safety
- ESLint and Prettier for code quality

### 9.2 Build and Run
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### 9.3 Deployment
- Environment variable management for different environments

## 10. System Requirements

### 10.1 Server Requirements
- Node.js 14+ runtime
- MongoDB database
- SMTP server for email functionality
- Firebase project for push notifications

### 10.2 API Keys and Configuration
- WeBook API key
- JWT secrets
- SMTP server credentials
- MongoDB connection string

## 11. Future Enhancements

Potential areas for future development:
- Advanced reporting and analytics
- Multi-language support
- Mobile app integration
- Enhanced booking management features
- Revenue management functionality

## 12. Troubleshooting

### 12.1 Common Issues
- Authentication failures
- API integration errors
- Database connectivity issues

### 12.2 Logging
- Morgan for HTTP request logging
- Custom error logging mechanisms