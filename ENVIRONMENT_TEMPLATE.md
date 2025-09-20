# Environment Variables Template

## Quick Setup

### 1. Copy Template
```bash
# Copy the template to create your .env file
cp env.template .env
```

### 2. Generate with Script
```bash
# Or use the automated script
node scripts/generate-env.js
```

## Required Variables

### 🔴 Critical (Must Update)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure secret for authentication
- `WEB3_PROVIDER_URL` - Blockchain provider (Infura/Alchemy)
- `MARKETPLACE_CONTRACT_ADDRESS` - Deployed contract address
- `PRIVATE_KEY` - Wallet private key for transactions

### 🟡 Important (Should Update)
- `COMPLIANCE_CONTACT` - Your support email
- `IPFS_API_URL` - IPFS node endpoint
- `LEGAL_JURISDICTIONS` - Your legal jurisdictions
- `EMAIL_FROM` - Your email address

### 🟢 Optional (Can Use Defaults)
- `PORT` - Server port (default: 5000)
- `LOG_LEVEL` - Logging level (default: info)
- `RATE_LIMIT` - Rate limiting (default: 3000)
- `DEBUG` - Debug mode (default: false)

## Environment Categories

### Server Configuration
```env
NODE_ENV=development
PORT=5000
```

### Database Configuration
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

### JWT Configuration
```env
JWT_SECRET=your_super_secure_jwt_secret_key
```

### IPFS Configuration
```env
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Web3 Configuration
```env
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234
GAS_PRICE=20000000000
GAS_LIMIT=500000
```

### Marketplace Contract
```env
MARKETPLACE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

### Security & Compliance
```env
ENABLE_ANTI_PIRACY=true
SUPPORTED_CHAINS=ethereum,polygon
LEGAL_JURISDICTIONS=US,EU,IN
COMPLIANCE_CONTACT=support@yourdomain.com
```

### Email Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Feature Flags
```env
ENABLE_MARKETPLACE=true
ENABLE_TRADING=true
ENABLE_NFT=true
ENABLE_ANALYTICS=true
```

## Security Best Practices

### 1. Generate Secure Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Environment Separation
- **Development**: Use local services and test values
- **Staging**: Use staging services with real-like data
- **Production**: Use production services with secure secrets

### 3. Secret Management
- Never commit `.env` files to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use environment-specific configurations

## Validation

### Check Required Variables
```bash
# Validate your .env file
node -e "
const config = require('./src/config');
console.log('✅ Configuration loaded successfully');
console.log('Database URL:', config.databaseUrl ? 'Set' : 'Missing');
console.log('JWT Secret:', config.jwtSecret ? 'Set' : 'Missing');
console.log('Web3 Provider:', config.web3ProviderUrl ? 'Set' : 'Missing');
"
```

### Test Database Connection
```bash
# Test database connectivity
npm run dev
# Check console for database connection status
```

## Troubleshooting

### Common Issues

1. **Missing .env file**
   ```bash
   cp env.template .env
   ```

2. **Invalid database URL**
   - Check PostgreSQL is running
   - Verify connection string format
   - Ensure database exists

3. **Web3 connection issues**
   - Verify Infura/Alchemy project ID
   - Check network connectivity
   - Ensure private key is valid

4. **IPFS connection issues**
   - Start local IPFS node: `ipfs daemon`
   - Or use public gateway

### Getting Help

- Check `ENVIRONMENT_SETUP.md` for detailed setup
- Review `POWERSHELL_SETUP.md` for Windows issues
- Run `npm run setup` for automated generation
