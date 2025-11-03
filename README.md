# Rubikcon Game Site

This is a full-stack web application for Rubikcon game store, built with a modern technology stack. It features a React-based client and an Express-based server.

## Tech Stack

- **Frontend:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [React Query](https://tanstack.com/query/latest) for data fetching
  - [wouter](https://github.com/molefrog/wouter) for routing

- **Backend:**
  - [Node.js](https://nodejs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or a compatible package manager

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd Rubikcon-gameSite
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

## Available Scripts

- `npm run dev`: Starts the development server for both the client and server with hot-reloading.
- `npm run build`: Builds the client and server for production.
- `npm run start`: Starts the production server.
- `npm run db:push`: Pushes database schema changes using Drizzle ORM.

## VPS Deployment

### Quick Deploy to Hostinger VPS

1. **SSH into your VPS:**
   ```bash
   ssh root@72.61.16.28
   ```

2. **Navigate to project directory:**
   ```bash
   cd /var/www/rubikcongames.xyz
   ```

3. **Run deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Deployment Steps

1. **Update code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && npm run build && cd ..
   ```

3. **Restart application:**
   ```bash
   pm2 restart rubikcon-games
   ```

### Troubleshooting

- **Check application logs:** `pm2 logs rubikcon-games`
- **Check application status:** `pm2 status`
- **Restart Nginx:** `systemctl restart nginx`
- **Check Nginx status:** `systemctl status nginx`

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
