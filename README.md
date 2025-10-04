# SnapieAdmin

An admin portal for managing blacklisted users in the Snapie application. Built with Next.js, TypeScript, and Tailwind CSS with full Hive blockchain authentication.

## Features

- 🔐 **Hive Blockchain Authentication** - Secure challenge-response authentication flow
- 🔑 **Hive Keychain Integration** - Browser extension support with posting key fallback
- 👥 **User Management** - Add/Remove blacklisted users via dashboard
- 🌐 **API Integration** - CORS-safe proxy integration with menosoft.xyz backend
- 📱 **Responsive Design** - Modern UI with Tailwind CSS and status indicators
- ⚡ **Next.js App Router** - Fast, modern React framework with Turbopack
- 🛡️ **JWT Token Management** - Secure token handling with localStorage persistence
- 🔧 **Configurable Port** - Environment-based port configuration for deploymentin Portal

An admin portal for managing blacklisted users in the Snapie application. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Hive Blockchain Authentication** - Secure challenge-response authentication
- � **Hive Keychain Integration** - Browser extension support for secure signing
- �👥 **User Management** - Add/Remove blacklisted users
- 🌐 **API Integration** - Full integration with menosoft.xyz backend
- 📱 **Responsive Design** - Modern UI with Tailwind CSS
- ⚡ **Next.js App Router** - Fast, modern React framework

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Hive blockchain account with posting key access
- [Hive Keychain browser extension](https://hive-keychain.com/) (recommended)
- Access to menosoft.xyz API endpoints

### Installation

1. Clone the repository:
```bash
git clone https://github.com/menobass/snapieadmin.git
cd snapieadmin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `PORT` - Port number for the development server (default: 3000)
- `NEXT_PUBLIC_BASE_API_URL` - Your backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_VERSION` - Application version

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # CORS proxy API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── blacklisted/   # User management endpoints
│   ├── login/             # Login page
│   ├── dashboard/         # Admin dashboard
│   └── page.tsx           # Home page (auth redirect)
├── components/            # React components
│   ├── LoginForm.tsx      # Enhanced auth form with status indicators
│   └── Dashboard.tsx      # Main admin interface
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication state management
├── lib/                   # Utilities and services
│   ├── api.ts             # API service with JWT handling
│   └── hiveAuth.ts        # Hive Keychain integration
└── types/                 # TypeScript definitions
    └── auth.ts            # Authentication types
```

## API Integration

The application uses Hive blockchain authentication with the following endpoints:

### Authentication (3-Step Challenge-Response)

#### Step 1: Request Challenge
```http
POST /api/auth/challenge
Content-Type: application/json

{
  "username": "your_hive_username"
}
```

#### Step 2: Sign Challenge
The client signs the challenge using Hive Keychain or posting key.

#### Step 3: Verify Signature
```http
POST /api/auth/verify
Content-Type: application/json

{
  "username": "your_hive_username",
  "challenge": "challenge_from_step_1",
  "timestamp": 1696281600000,
  "signature": "hex_signature"
}
```

### Blacklist Management
- `GET /api/blacklisted` - Get all blacklisted users
- `POST /api/blacklisted` - Add user to blacklist  
- `DELETE /api/blacklisted/:id` - Remove user from blacklist

All protected endpoints require `Authorization: Bearer <jwt_token>` header.

## Usage

### First Time Setup
1. Install [Hive Keychain browser extension](https://hive-keychain.com/) (recommended)
2. Add your Hive account to Keychain with posting key access

### Using the Admin Portal
1. Navigate to the application at http://localhost:3000
2. Enter your Hive username
3. Choose authentication method:
   - **Recommended**: Use Hive Keychain (secure, no manual key entry)
   - **Alternative**: Enter posting key manually (less secure)
4. Complete the signature challenge when prompted
5. Access the dashboard to manage blacklisted users
6. Logout when finished

### Managing Blacklisted Users
- **View**: All blacklisted users are displayed in a table
- **Add**: Use the form to add new users to the blacklist
- **Remove**: Click the trash icon next to any user to remove them
- **Debug**: Use the debug panel to test API connectivity

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience  
- **Tailwind CSS** - Utility-first CSS framework
- **@hiveio/dhive** - Hive blockchain JavaScript library
- **Hive Keychain** - Browser extension for secure key management
- **Axios** - HTTP client for API requests
- **Lucide React** - Modern icon library
- **Crypto-JS** - Cryptographic functions
