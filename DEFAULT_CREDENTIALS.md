# Default Login Credentials

## Admin Account

- **Email**: admin@gmail.com
- **Password**: 123456789
- **Role**: Admin
- **Access**: Full system access

## Receptionist Account

- **Email**: receptionist@gmail.com
- **Password**: 123456789
- **Role**: Receptionist
- **Access**: Reception dashboard and patient management

## Doctor Accounts

- **Password**: 123456789 (same for all doctors)
- **Email Format**: [firstname]@gmail.com
- **Examples**:
  - devansheeba@gmail.com (Dr. Devansheeba Jadeja Sodha)
  - bharat@gmail.com (Dr. Bharat Kalsariya)
  - rajveersinh@gmail.com (Dr. Rajveersinh Sodha)
  - upasna@gmail.com (Dr. Upasna Dhuliya)
  - bhavesh@gmail.com (Dr. Bhavesh Khandhar)

## Setup Instructions

### To create/update default users:

```bash
cd backend
node scripts/setupDefaultUsers.js
```

### To create/update doctor login accounts:

```bash
cd backend
node scripts/dev/createDoctorLogins.js
```

## Security Notes

- These are default credentials for development/testing only
- Change all passwords in production
- Consider implementing two-factor authentication
- Enable audit logging for sensitive operations
