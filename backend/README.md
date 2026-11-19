# Retail Inventory Management System - Backend

This is the enterprise backend for RetailHub, built using Java, Spring Boot, Spring Security, JWT, and PostgreSQL.

## Technologies Used
- **Java 17+**
- **Spring Boot 3** (Web, Data JPA, Security, Validation)
- **PostgreSQL**
- **JJWT (Java JWT)**
- **BCrypt Password Hashing**
- **Lombok**
- **Maven**

---

## Configuration & Environment Variables

| Variable | Description | Default / Requirement |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/retail_inventory` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | Configured locally in `application.properties` |
| `JWT_SECRET` | Secret key for signing HS256 tokens | Mandatory in `prod` profile (min. 32 characters / 256 bits). Dev fallback available only for non-production testing. |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` (default) or `prod` |

---

## Zero Hardcoded Credentials Policy

The application contains **no hardcoded demo accounts** in active code, configuration, or startup seeders. Neither `admin@retail.com` nor `user@retail.com` are created at startup.

### 1. How to Provision the Initial Administrator Account (One-Time Bootstrap)
When setting up a new environment or after cleaning old demo accounts:
1. Start the application.
2. Execute the one-time bootstrap endpoint (available only when **0** administrator accounts exist):
   ```bash
   curl -X POST http://localhost:8080/api/auth/bootstrap-admin \
     -H "Content-Type: application/json" \
     -d '{
       "name": "System Administrator",
       "email": "your_admin_email@domain.com",
       "password": "YourStrongPasswordHere!",
       "phone": "1234567890",
       "address": "Headquarters"
     }'
   ```
3. The backend will hash the password with BCrypt, assign `ROLE_ADMIN`, and return the initial JWT token.
4. **Permanent One-Time Lock**: Once any administrator account exists in the database, this endpoint permanently locks (`HTTP 400 Bad Request`) and cannot be reused to create additional administrators.

### 2. How Customers Register
Customers register via the standard public registration endpoint or the frontend Register page (`/register`):
- Endpoint: `POST /api/auth/register`
- All public registrations are strictly assigned `ROLE_USER`, regardless of any role submitted in the payload.

### 3. Safe PostgreSQL Database Cleanup for Legacy Demo Accounts
If your PostgreSQL database contains old demo records from previous development, execute this targeted SQL script (which only affects the specific demo emails and safely reassigns or removes associated demo records):
```sql
-- Step 1: Check existing users
SELECT id, email, role FROM users;

-- Step 2: Remove legacy demo accounts safely
-- (If orders exist referencing these demo users, delete the test orders or reassign customer_id first)
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (SELECT id FROM users WHERE email IN ('admin@retail.com', 'user@retail.com')));
DELETE FROM orders WHERE customer_id IN (SELECT id FROM users WHERE email IN ('admin@retail.com', 'user@retail.com'));
DELETE FROM users WHERE email IN ('admin@retail.com', 'user@retail.com');
```

---

## How to Run

### Development Mode:
```bash
./mvnw spring-boot:run
```

### Production Mode:
```bash
export JWT_SECRET="YourCryptographicallySecureKeyAtLeast32CharsLong!"
export SPRING_PROFILES_ACTIVE="prod"
./mvnw spring-boot:run
```
*(In production, startup will fail immediately if `JWT_SECRET` is unset or less than 32 characters).*
