# Component Architecture Rules

Before building any page, create a reusable component system. Never create duplicated UI elements. Create a shared component library with the following categories:

## Buttons
- **PrimaryButton**: Main CTA actions (Background: BTS Green `#0B6E2E`).
- **SecondaryButton**: Alternative actions.
- **DangerButton**: Delete/cancel actions.
- **GhostButton**: Low priority actions.

## Forms
Create reusable components for:
- `Input`
- `Select`
- `DatePicker`
- `TimePicker`
- `SearchBar`
- `PhoneInput`
- `PaymentInput`

*Rules*: Large touch area, mobile-friendly, clear validation, error states, loading states.

## Cards
- **TripCard**: Displays departure, destination, date, time, price, available seats, and a "Réserver" button.
- **BusCard**: Displays bus number, capacity, occupied seats, and status.
- **TicketCard**: Displays ticket number, QR Code, and trip information.

## Data Components (Admin)
Create reusable components for:
- `DataTable`
- `FilterBar`
- `StatsCard`
- `Charts`
- `Pagination`
- `Modal`
- `Dropdown`

## Feedback Components
Create reusable components for:
- `Toast` notification
- `Alert`
- `Loading spinner`
- `Empty state`
- `Error state`
- `Success message`

## Technical Constraints
All components must:
- Be reusable
- Have TypeScript types
- Have clear naming
- Follow BTS colors
- Be responsive
