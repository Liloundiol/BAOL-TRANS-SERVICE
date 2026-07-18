# BTS User Experience Rules

The platform must prioritize speed and simplicity.

---

## 1. Client Booking Flow
The main reservation flow must be possible in less than 2 minutes. The user must never feel lost.

### Maximum Steps:
- **Step 1**: Search trip
- **Step 2**: Select date and time
- **Step 3**: Choose seat
- **Step 4**: Payment (Wave)
- **Step 5**: Receive digital ticket

---

## 2. Booking Experience
- **Always display**:
  - Available seats
  - Price
  - Travel information
  - Payment status
- **Before payment**, show booking summary:
  - Trip details
  - Date & Time
  - Bus number / details
  - Seat selected
  - Price

---

## 3. Mobile First Design
Design priority order:
1. **Mobile phone** (First priority)
2. **Tablet** (Second priority)
3. **Desktop** (Third priority)

### Mobile Best Practices:
- Use bottom navigation on mobile devices.
- Large, comfortable touch targets/buttons.
- Simple, step-by-step forms.

---

## 4. Admin Experience
The admin interface must prioritize:
- **Speed**: Quick loading times and fast searches.
- **Data visibility**: Clean tabular layouts and stats.
- **Control**: Easy actions to add/edit/delete trips and buses.
- **Dashboard first**: Important metrics must be visible immediately upon login.

---

## 5. Error Handling & Feedback
- **Feedback**: Every action must have a loading state, success feedback, error message, and confirmation dialog if needed.
- **User-friendly errors**: Never show technical errors to the user.
  - *Bad*: "Database error 500"
  - *Good*: "Une erreur est survenue. Veuillez réessayer."
