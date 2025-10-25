# Rubikcon Games - Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Flutterwave account
- WalletConnect Project ID

## Environment Setup

1. **Database Setup (Supabase)**
   - Create a new Supabase project
   - Copy your database URL, project URL, and API keys
   - Update `.env` file with Supabase credentials

2. **Payment Provider Setup**
   
   **Flutterwave:**
   - Sign up at https://flutterwave.com
   - Get your public and secret keys from the dashboard
   - Set up webhook URL: `https://yourdomain.com/api/webhook/flutterwave`
   
   **WalletConnect:**
   - Create project at https://cloud.walletconnect.com
   - Get your project ID

3. **Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Update with your actual values:
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
   SUPABASE_URL="https://[PROJECT_REF].supabase.co"
   SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
   FLUTTERWAVE_PUBLIC_KEY="[YOUR_PUBLIC_KEY]"
   FLUTTERWAVE_SECRET_KEY="[YOUR_SECRET_KEY]"
   VITE_WALLETCONNECT_PROJECT_ID="[YOUR_PROJECT_ID]"
   ```

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Migration**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Update `FRONTEND_URL` and `BACKEND_URL` to your Vercel domain

### Alternative Hosting

**Netlify:**
- Build command: `npm run build:client`
- Publish directory: `dist/client`
- Functions directory: `dist`

**Railway/Render:**
- Build command: `npm run build`
- Start command: `npm start`

## Performance Optimizations

1. **CDN Setup (Cloudflare)**
   - Add your domain to Cloudflare
   - Enable caching for static assets
   - Configure compression

2. **Database Optimization**
   - Enable connection pooling in Supabase
   - Add database indexes for frequently queried fields

3. **Image Optimization**
   - Use WebP format for images
   - Implement lazy loading
   - Add image compression

## Payment Testing

**Flutterwave Test Cards:**
- Successful: 4187427415564246
- Declined: 4187427415564246 (with CVV 000)

**Crypto Testing:**
- Use testnet tokens on Sepolia/Goerli
- Test with small amounts first

## Monitoring

1. **Error Tracking**
   - Set up Sentry for error monitoring
   - Configure alerts for payment failures

2. **Analytics**
   - Add Google Analytics
   - Track conversion rates

## Security Checklist

- [ ] Environment variables secured
- [ ] Webhook signatures verified
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Database queries parameterized

## Support

For issues or questions:
- Check the troubleshooting section below
- Review Flutterwave documentation
- Contact support team

## Troubleshooting

**Common Issues:**

1. **Payment initialization fails**
   - Check Flutterwave API keys
   - Verify webhook URL is accessible
   - Check network connectivity

2. **Crypto payments not working**
   - Verify WalletConnect project ID
   - Check wallet connection
   - Ensure correct network selected

3. **Database connection issues**
   - Verify Supabase credentials
   - Check connection string format
   - Ensure database is accessible