# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Server Configuration
```env
NODE_ENV=development
PORT=5000
```

### Database Configuration
```env
DATABASE_URL=postgresql://username:password@localhost:5432/ipr_backend
```

### JWT Configuration
```env
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
```

### IPFS Configuration
```env
IPFS_API_URL=http://localhost:5001
```

### Web3 Configuration
```env
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
MARKETPLACE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
IP_REGISTRY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234
```

### Anti-Piracy & IP Protection
```env
ENABLE_ANTI_PIRACY=true
SUPPORTED_CHAINS=ethereum,polygon
```

### Legal Compliance
```env
LEGAL_JURISDICTIONS=US,EU,IN
COMPLIANCE_CONTACT=support@yourdomain.com
```

### Logging & Monitoring
```env
LOG_LEVEL=info
RATE_LIMIT=3000
```

## Quick Setup Commands

### 1. Create .env file
```bash
touch .env
```

### 2. Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Set up PostgreSQL Database
```bash
# Install PostgreSQL
# Create database
createdb ipr_backend

# Create user
psql -c "CREATE USER ipr_user WITH PASSWORD 'ipr_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ipr_backend TO ipr_user;"
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Development Server
```bash
npm run dev
```

## Production Environment

For production, ensure you:

1. **Change all default passwords and secrets**
2. **Use strong JWT secrets** (64+ characters)
3. **Set up proper database credentials**
4. **Configure secure Web3 provider**
5. **Set up IPFS node or use reliable service**
6. **Enable proper logging and monitoring**
7. **Set up SSL/TLS certificates**
8. **Configure proper CORS origins**

## Security Notes

- Never commit `.env` files to version control
- Use different secrets for development and production
- Regularly rotate API keys and secrets
- Monitor for unauthorized access
- Use environment-specific configurations
