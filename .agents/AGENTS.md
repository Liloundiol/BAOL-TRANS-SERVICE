# BTS Design System & UX Rules

This document outlines the rules for the Baol Trans Services (BTS) SaaS application interface. The detailed rules are also organized in separate files inside the `.agents/` folder.

---

## 1. Brand Identity
*See detailed file: [BRAND.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/BRAND.md)*

- **Brand**: BAOL TRANS SERVICES (BTS)
- **Goal**: Clean, modern, mobile-first SaaS design inspired by simple financial and booking applications like Wave, Uber, and Booking.
- **Philosophy**: Simple, Fast, Trustworthy, Professional, Accessible, Conversion-focused.
- **Constraint**: Never create a complex or overloaded interface.

---

## 2. Color System
*See detailed file: [COLORS.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/COLORS.md)*

- **Primary Brand Color (Green BTS - #0B6E2E)**: Main identity color of the platform. Use for main header, navigation, primary buttons, "Réserver" CTA buttons, important actions, and brand elements. Dominant brand color.
- **Secondary Green (Green Energy - #2FAE61)**: Add dynamism and modernity. Use for hover states, active states, icons, success indicators, and interactive elements. Do not replace primary green.
- **White (#FFFFFF)**: Main background color. 80% of the interface should use white space. Use for backgrounds, cards, sections, and forms.
- **Soft Black (Text Color - #1F1F1F)**: Main typography color. Use for titles, user information, descriptions, and content text. Never use pure black (#000000).
- **Conversion Color (Yellow BTS - #F4C430)**: Drive user attention and conversion. Use ONLY for commercial elements: prices, discounts, limited availability, "Dernières places", and important alerts. Must create urgency without overwhelming interface.
- **Information Color (Blue - #1E4ED8)**: Use moderately for official info, help sections, and secondary notices.
- **Color Usage Ratio**: White (80%), BTS Green (15%), Yellow (3%), Blue (2%). Avoid adding other colors.

---

## 3. Button Rules
*See detailed file: [BUTTONS.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/BUTTONS.md)*

- **Primary CTA (e.g. "Réserver")**: Background `#0B6E2E`, Text `white`, rounded corners, clear hierarchy. Hover background `#2FAE61`.
- **Secondary Buttons**: White background, green border, green text.
- **Disabled Buttons**: Neutral gray, reduced opacity.

---

## 4. Typography Rules
*See detailed file: [TYPOGRAPHY.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/TYPOGRAPHY.md)*

- **Style**: Modern SaaS typography (Inter, Geist, or Manrope).
- **Titles**: Strong hierarchy, Medium/Bold weight.
- **Body**: Easy reading, comfortable spacing.
- **Avoid**: Decorative fonts, too many font styles.

---

## 5. UI Component Rules
*See detailed file: [COMPONENTS.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/COMPONENTS.md)*

- **Cards**: White background, soft shadows, rounded corners, clear spacing.
- **Forms**: Large touch targets, mobile friendly, clear labels, simple validation messages.
- **Navigation**:
  - **Client App**: Simple, fast access to booking.
  - **Admin Dashboard**: Professional, data-focused, clean tables.

---

## 6. UX Principles
*See detailed file: [UX.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/UX.md)*

- **Platform Prioritization**: Speed and simplicity are the top priority.
- **Client Booking Flow (Max 5 steps, < 2 minutes)**:
  1. Search trip
  2. Select date and time
  3. Choose seat
  4. Payment (Wave)
  5. Receive digital ticket
- **Booking Display**: Always display available seats, price, travel information, and payment status. Show a complete booking summary before payment.
- **Mobile First**: Design for mobile phone first, then tablet, then desktop. Use bottom navigation, large buttons, and simple forms.
- **Admin Experience**: Prioritize speed, data visibility, and control. Metrics must be visible immediately on the dashboard.
- **Error Handling**: Never show technical errors (e.g., "Database error 500"). Use clean user-friendly messages like "Une erreur est survenue. Veuillez réessayer."
- **Action Feedback**: Every action must have a loading state, success feedback, error message, and confirmation.

---

## 7. Constraints (DO NOT)
*See detailed file: [CONSTRAINTS.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/CONSTRAINTS.md)*

- Never create complex gradients.
- Never use too many colors.
- Never use heavy animations.
- Never create crowded layouts or unnecessary decorative elements.
- Never use dark themes.

---

## 8. Final Vision
*See detailed file: [CONSTRAINTS.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/CONSTRAINTS.md)*

BTS must look clean, modern, fast, reliable, student-friendly, and conversion-oriented.
Main feeling: "Book your trip in seconds."

---

## 9. Component Architecture Rules
*See detailed file: [ARCHITECTURE.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/ARCHITECTURE.md)*

Before building any page, create a reusable component system. Never create duplicated UI elements. Create a shared component library with the following categories:

### Buttons
- **PrimaryButton**: Main CTA actions (Background: BTS Green `#0B6E2E`).
- **SecondaryButton**: Alternative actions.
- **DangerButton**: Delete/cancel actions.
- **GhostButton**: Low priority actions.

### Forms
Create reusable components for:
- `Input`
- `Select`
- `DatePicker`
- `TimePicker`
- `SearchBar`
- `PhoneInput`
- `PaymentInput`

*Rules*: Large touch area, mobile-friendly, clear validation, error states, loading states.

### Cards
- **TripCard**: Displays departure, destination, date, time, price, available seats, and a "Réserver" button.
- **BusCard**: Displays bus number, capacity, occupied seats, and status.
- **TicketCard**: Displays ticket number, QR Code, and trip information.

### Data Components (Admin)
Create reusable components for:
- `DataTable`
- `FilterBar`
- `StatsCard`
- `Charts`
- `Pagination`
- `Modal`
- `Dropdown`

### Feedback Components
Create reusable components for:
- `Toast` notification
- `Alert`
- `Loading spinner`
- `Empty state`
- `Error state`
- `Success message`

### Technical Constraints
All components must:
- Be reusable
- Have TypeScript types
- Have clear naming
- Follow BTS colors
- Be responsive

---

## 10. Business Logic Rules
*See detailed file: [BUSINESS_LOGIC.md](file:///c:/MES%20PROJETS/DEV/SAAS%20BAOL%20BAOL%20YI/.agents/BUSINESS_LOGIC.md)*

- **User Roles**: `STUDENT`, `ADMIN`, `AGENT`, `CONTROLLER`.
- **Trips & Buses**: Default capacity is 13 seats. When a bus becomes full (13/13), a new bus must be created automatically.
- **Reservation Statuses**: `PENDING`, `PAID`, `CANCELLED`.
- **Payment & Ticket**: Payment must always be verified and linked to User, Reservation, and Ticket before ticket generation. Tickets are generated automatically with a Unique ID and QR Code.
- **Security**: Never expose credentials, passwords, or private payment data. Use authentication, authorization, and secure endpoints.
