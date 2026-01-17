# Order Management & Authentication System

## Overview
Add a complete order management system with authentication so only authorized Indotech organization members can access the app, save orders, and track them by city/station for easier dispatch management.

---

## Part 1: Backend Setup (Lovable Cloud with Supabase)

### 1.1 Enable Lovable Cloud
- Set up Lovable Cloud to get a managed Supabase backend
- This provides database, authentication, and row-level security out of the box

### 1.2 Database Tables

**`orders` table** - Store all order confirmations:
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamp | Order creation time |
| user_id | uuid | Reference to auth.users |
| party_name | text | Customer name |
| party_address | text | Customer address |
| party_phone | text | Phone number |
| party_email | text | Email |
| broker_name | text | Broker name (optional) |
| item_description | text | Product type (8mm/12mm) |
| quantity | integer | Quantity in kg |
| number_of_coils | integer | Number of coils |
| rate | decimal | Rate per kg |
| payment_terms | text | Payment terms |
| station | text | Delivery station/city |
| delivery_date | date | Expected delivery |
| notes | text | Additional notes |
| status | text | Order status (pending/confirmed/dispatched/delivered) |

**`user_profiles` table** - Organization user data:
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | References auth.users |
| full_name | text | User's full name |
| role | text | admin/staff |
| created_at | timestamp | Account creation time |

### 1.3 Row-Level Security (RLS)
- Enable RLS on all tables
- Only authenticated users can read/write orders
- Users can only see orders (organization-wide visibility for dispatch coordination)

---

## Part 2: Authentication System

### 2.1 Login Page (`/login`)
- Email and password authentication
- Clean, branded login form matching Indotech theme
- "Forgot password" functionality
- No public signup - only organization members can access

### 2.2 Protected Routes
- Wrap all routes with authentication check
- Redirect unauthenticated users to login
- Add logout button to header

### 2.3 User Management (Admin Only)
- Admin can invite new organization members via email
- Simple user list showing team members

---

## Part 3: Order Management Features

### 3.1 Save Orders
- Add "Save Order" button alongside existing PDF/WhatsApp buttons
- Automatically save order to database with "pending" status
- Show confirmation toast on successful save

### 3.2 Orders Dashboard (`/orders`)
- Table view of all saved orders
- Columns: Date, Party Name, Station/City, Quantity, Status, Actions
- Filter by status (All/Pending/Confirmed/Dispatched/Delivered)
- Search by party name or station

### 3.3 City-Based Dispatch View (`/dispatch`)
- Group orders by station/city for easier dispatch planning
- Cards showing each city with order count
- Click to expand and see all orders for that city
- Quick status update buttons (Mark as Dispatched, Delivered)

### 3.4 Order Detail View
- View full order details
- Update order status
- Re-generate PDF
- Edit order (if not yet dispatched)

---

## Part 4: UI/UX Updates

### 4.1 Navigation
- Add sidebar or top navigation with:
  - New Order (current form)
  - Orders List
  - Dispatch View
  - Logout

### 4.2 Header Updates
- Show logged-in user name
- Add logout button

### 4.3 Status Badges
- Visual indicators for order status:
  - Pending: Yellow
  - Confirmed: Blue
  - Dispatched: Orange
  - Delivered: Green

---

## File Structure (New Files)

```
src/
  components/
    auth/
      LoginForm.tsx
      ProtectedRoute.tsx
    orders/
      OrdersTable.tsx
      OrderCard.tsx
      DispatchView.tsx
      StatusBadge.tsx
    layout/
      AppLayout.tsx
      Sidebar.tsx
  pages/
    Login.tsx
    Orders.tsx
    Dispatch.tsx
    OrderDetail.tsx
  hooks/
    useAuth.ts
    useOrders.ts
  lib/
    supabase.ts
```

---

## Implementation Order

1. **Enable Lovable Cloud** - Set up backend infrastructure
2. **Create database tables** - orders and user_profiles with RLS
3. **Build authentication** - Login page, protected routes, auth hooks
4. **Add order saving** - Integrate save functionality in existing form
5. **Build orders list** - Table view with filters and search
6. **Build dispatch view** - City-grouped order management
7. **Add navigation** - Sidebar/nav with all pages linked

---

## Expected Outcome
- Secure app accessible only to Indotech team members
- All order confirmations saved and searchable
- Easy dispatch management by grouping orders by city/station
- Full order lifecycle tracking (Pending -> Confirmed -> Dispatched -> Delivered)
