# Snapie Admin Portal

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

1. Clone the repository or navigate to the project directory
2. Install dependencies:

```bash
npm install
```

3. Configure your API endpoints in `src/lib/api.ts` if needed (currently set to `https://menosoft.xyz/api`)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── login/          # Login page
│   ├── dashboard/      # Admin dashboard
│   └── page.tsx        # Home page (redirects based on auth)
├── components/         # React components
│   ├── LoginForm.tsx   # Authentication form
│   └── Dashboard.tsx   # Main admin interface
├── lib/                # Utilities and services
│   └── api.ts          # API service with JWT handling
└── types/              # TypeScript type definitions
    └── auth.ts         # Authentication types
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
