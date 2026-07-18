# BTS Business Logic Rules

The system must respect these business rules.

---

## 1. User Roles
- **Roles**: `STUDENT`, `ADMIN`, `AGENT`, `CONTROLLER`.
- Each role has specific permissions.

---

## 2. Trips
A trip contains:
- Departure
- Destination
- Date
- Time
- Price
- Status

---

## 3. Buses & Capacity
- A bus belongs to a trip.
- **Default capacity**: 13 seats.
- **Seat structure**: Seat 1, Seat 2, Seat 3, ..., Seat 13.

---

## 4. Automatic Bus Creation
- **Critical rule**: When a bus reaches full capacity (13/13), automatically create another bus for the same trip.
- *Example*:
  - Trip: UGB → Dakar
  - Bus BTS-001: 13/13 FULL
  - System automatically creates Bus BTS-002: 0/13 AVAILABLE

---

## 5. Reservation Statuses
- **PENDING**: Waiting for payment.
- **PAID**: Payment successful.
- **CANCELLED**: Reservation cancelled.

---

## 6. Payment & Ticket Generation
- Payment must always be linked to:
  - User
  - Reservation
  - Ticket
- **Constraint**: Never confirm a reservation without successful payment.
- **Ticket**: Automatically generated after payment.
  - Must contain: Unique ID, QR Code, User, Trip, Bus, and Seat.

---

## 7. Security
- **Never expose**:
  - Payment details/information
  - User passwords (must be securely hashed)
  - Private user data
- **Security requirements**:
  - Secure Authentication & Authorization.
  - Strict input validation.
  - Secure API endpoints.
