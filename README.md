# RetailHub — Retail Inventory & Order Management System

RetailHub is a full-stack, enterprise-grade retail inventory and order management platform built with a high-performance Java Spring Boot backend, a modern React/Vite single-page application frontend, and a PostgreSQL relational database.

---

## 1. Overview & Key Capabilities

RetailHub streamlines retail operations across inventory tracking, warehouse logistics, supplier purchase orders, and consumer storefront experiences. The platform enforces strict role-based access control (RBAC), multi-facility stock allocation, and transactional audit trails.

### Core Implemented Features

- **Enterprise Authentication & Security**:
  - Stateless JWT token-based authentication (HS256) with standard 24-hour expiration.
  - BCrypt password hashing with high work factor.
  - Role-based authorization (`ROLE_ADMIN` and `ROLE_USER`) enforced via method-level `@PreAuthorize` guards.
  - One-time secure Administrator bootstrap endpoint (`/api/auth/bootstrap-admin`) with transactional lock.
  - Public customer registration strictly enforcing `ROLE_USER` regardless of client payload.
  - Real backend password reset mechanism (`/api/auth/forgot-password` and `/api/auth/reset-password`) using SHA-256 hashed single-use tokens with 15-minute expiration and anti-enumeration protections.
  - Cross-portal role separation preventing customer accounts from accessing administrative consoles and vice-versa.

- **Admin Operations & Multi-Facility Management**:
  - Real-time dashboard with inventory analytics, stock valuation, and order flow metrics.
  - Catalog management: Create, update, soft-delete, and reactivate products and categories.
  - Warehouse tracking: Monitor stock levels across multiple regional fulfillment centers.
  - Stock transfers: Formal workflow (`REQUESTED` → `APPROVED` → `COMPLETED`) for transferring items between warehouses with ledger reconciliation.
  - Procurement & Purchase Orders: Draft, submit, approve, and receive inbound supplier shipments with automatic inventory updates.
  - Customer Order Fulfillment: Order status progression (`PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED` or `CANCELLED`) with automatic inventory reservation and return handling.
  - Stock transaction audit log: Ledger tracking all `SALE`, `PURCHASE`, `TRANSFER_IN`, `TRANSFER_OUT`, and `RETURN` events.

- **Customer Storefront Experience**:
  - Live product catalog with category filtering and real-time inventory availability.
  - Cart management with dynamic total calculations and client-side persistence.
  - Seamless checkout flow validating multi-warehouse availability before order placement.
  - Order history and single-order status tracking with strict ownership isolation (users can only access their own orders).

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3.2.4 (Spring Web, Spring Security, Spring Data JPA, Validation), JJWT 0.11.5, Lombok |
| **Frontend** | React 18, Vite 8, React Router 6, Axios, Lucide React, Recharts |
| **Database** | PostgreSQL 16+ (Relational integrity, Foreign Keys, Sequences, Indexes) |
| **Build & Tooling**| Apache Maven 3.9+, Node.js 18+, npm 9+ |

---

## 3. Project Directory Structure

```text
RetailHub/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/retailinventory/
│   │   │   │   ├── config/          # SecurityConfig, WebMvcConfig, DataInitializer
│   │   │   │   ├── controller/      # Auth, Admin, Product, Order, Warehouse, PO Controllers
│   │   │   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   │   │   ├── entity/          # JPA Entities (User, Product, Order, Inventory, etc.)
│   │   │   │   ├── exception/       # GlobalExceptionHandler, Custom Exceptions
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   ├── security/        # JwtUtil, JwtAuthenticationFilter, UserDetailsService
│   │   │   │   └── service/         # Domain Business Logic & Transaction Services
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-prod.properties
│   ├── schema.sql                   # Complete PostgreSQL DDL Schema dump
│   ├── pom.xml                      # Maven project configuration
│   └── .env.example                 # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/              # Admin and Customer UI components, navigation, modals
│   │   ├── context/                 # AuthContext, CartContext, ThemeContext
│   │   ├── layouts/                 # AdminLayout, UserLayout
│   │   ├── pages/
│   │   │   ├── admin/               # Products, Inventory, Orders, POs, Transfers, Reports
│   │   │   ├── auth/                # Dual-portal Login and Registration
│   │   │   └── user/                # Products, Details, Cart, Checkout, Orders
│   │   ├── routes/                  # ProtectedRoute and AppRoutes
│   │   ├── services/                # Axios API services for all domain endpoints
│   │   ├── index.css                # Cohesive design system & typography
│   │   └── main.jsx                 # Application entry point
│   ├── package.json                 # Node dependencies & scripts
│   ├── vite.config.js               # Vite build configuration
│   └── .env.example                 # Frontend API configuration template
├── .gitignore                       # Clean Git exclusion rules
└── README.md                        # Master project documentation
```

---

## 4. Prerequisites

Before running the application locally, ensure you have:

- **Java Development Kit (JDK) 17+**
- **Node.js 18+** & **npm 9+**
- **PostgreSQL 15+** server running locally or accessible via network

---

## 5. PostgreSQL Database Setup

1. Start your local PostgreSQL service.
2. Create a new database named `retail_inventory`:
   ```sql
   CREATE DATABASE retail_inventory;
   ```
3. (Optional) Initialize the tables directly using the included schema dump:
   ```bash
   psql -U postgres -d retail_inventory -f backend/schema.sql
   ```
   *Note: Spring Boot's Hibernate `ddl-auto=update` can also create and synchronize the tables automatically upon startup.*

---

## 6. Backend Configuration & Startup

### Environment Variables

You can configure the backend via environment variables or by copying `backend/.env.example`:

| Variable | Description | Default Value |
|---|---|---|
| `DB_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/retail_inventory` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` (or your local password) |
| `JWT_SECRET` | 256-bit signing key | Auto-configured for dev; required in `prod` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` |
| `SERVER_PORT` | HTTP server port | `8080` |

### Running the Backend

From the `backend` directory:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The Spring Boot backend will start on `http://localhost:8080` with the API root at `http://localhost:8080/api`.

---

## 7. Frontend Configuration & Startup

From the `frontend` directory:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

The Vite dev server will start on `http://localhost:5173`.

---

## 8. Authentication & Account Provisioning

RetailHub strictly adheres to a **Zero Hardcoded Credentials Policy**. There are no default passwords or pre-seeded demo accounts in production.

### Initial Administrator Provisioning (One-Time Bootstrap)
When deploying a fresh instance where 0 administrators exist, provision the initial administrator via the secure bootstrap endpoint:

```bash
curl -X POST http://localhost:8080/api/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Administrator",
    "email": "admin@yourcompany.com",
    "password": "YourStrongPasswordHere!",
    "phone": "555-0100",
    "address": "Headquarters"
  }'
```

- The backend hashes the password using BCrypt, creates the account with `ROLE_ADMIN`, and issues the initial JWT token.
- **Permanent Lock**: Once an administrator exists, the bootstrap endpoint permanently returns `HTTP 400 Bad Request`.

### Customer Registration
Customers register publicly via the storefront registration interface (`/register`) or `POST /api/auth/register`. All public registrations are assigned `ROLE_USER`.

---

## 9. Testing & Production Build

### Frontend Production Build
To verify and bundle the frontend for production:
```bash
cd frontend
npm run build
```

### Backend Build & Test
To compile and execute the backend test lifecycle:
```bash
cd backend
./mvnw test
```

---

## 10. Security Highlights

- **Secret Isolation**: Configuration properties reference environment variables with zero plaintext credentials committed to version control.
- **CORS Protection**: Whitelists only trusted origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`).
- **Cryptographic Security**: Passwords stored exclusively as BCrypt salted hashes; reset tokens stored as SHA-256 hashes with short-lived expirations.
- **Privilege Separation**: Customers attempting to call administrative APIs receive `HTTP 403 Forbidden`. Customer order queries verify ownership, preventing cross-tenant data leakage.
