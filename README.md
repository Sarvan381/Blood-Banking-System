# PulseLink | Enterprise Blood Banking & Transfusion System

A comprehensive, zero-dependency, modern web application designed to connect blood donors, hospitals, and blood banks. The system provides end-to-end management of donor registrations, cold-chain blood inventory tracking, emergency transfusion requests, and real-time dispatch logistics.

Built strictly with **HTML5, CSS3, and modern Vanilla JavaScript (ES6+)** with **zero external libraries or CDN dependencies**.

---

## 🚀 Key Modules & Capabilities

### 1. 🏥 Real-Time Blood Inventory & Cold-Chain Tracking
- **8 Blood Groups Supported**: A+, A-, B+, B-, AB+, AB-, O+, O-.
- **5 Blood Components**: Packed Red Blood Cells (PRBC), Whole Blood (WB), Platelets (PLT), Fresh Frozen Plasma (FFP), and Cryoprecipitate (CRYO).
- **Unit/Bag ID Tracking**: Bag ID, component type, exact volume (ml), collection date, automated shelf-life expiry calculation, storage location (e.g. `Fridge A-01 (Shelf 1)`, `Agitator AG-1`), screening status (HIV, HBV, HCV, Syphilis, Malaria NAT/Serology), and allocation states (*Available*, *Reserved*, *Testing/Quarantine*, *Dispatched*).
- **Critical Threshold Alerts**: Automatic visual warning when stock falls below 3 units for any blood group, or when units are within 7 days of expiration.
- **Exporting**: Complete CSV export of live inventory for compliance audits.

### 2. 🚨 Emergency Blood Requests & Dispatch Hub
- **Triage Urgency Levels**:
  - `STAT / Code Red`: Immediate trauma response (under 1 hour).
  - `Urgent`: Surgery / high priority (within 4 hours).
  - `Routine`: Elective / standard transfusion (within 24 hours).
- **Smart Compatibility Matching Engine**: Calculates exact blood group matches and medically compatible alternative groups (e.g., O- universal red cell donor, AB+ universal plasma donor) based on AABB/WHO standards.
- **Auto-Allocation**: Fast-track reservation of compatible bags for STAT requests.
- **Live Dispatch Pipeline**: Visual multi-stage status tracker (*Requested* &rarr; *Reserved & Cross-matched* &rarr; *Cold-Chain Transit* &rarr; *Delivered / Infused*) with simulated ambulance ETA countdown.

### 3. 🩸 Donor Registration & LifeSaver Portal
- **Donor Registration Form**: Captures name, blood group, contact information, weight qualification check (&ge; 50kg), gender, and residential zone.
- **Eligibility Assessment**: Automatic 90-day whole blood donation interval tracking. Includes an interactive 4-question pre-screening quiz.
- **LifeSaver Digital ID Pass**: Generates a card with barcode, verified status, donation tally, and estimated lives saved (3 lives per donation).
- **Urgent Callout Simulator**: One-click simulated SMS/email callout to notify matching donors in critical shortage situations.

### 4. 🔬 Transfusion Compatibility Calculator
- Interactive visual matrix: Click any blood group to immediately inspect:
  - Red Blood Cell (RBC) donation and reception rules.
  - Plasma & Platelets compatibility rules.
  - Population rarity percentages and clinical guidelines.

### 5. 🎪 Blood Donation Drives & Mobile Units
- Upcoming blood drives with date, venue, organizer, and target collection progress bars.
- Interactive RSVP / Participant registration.

### 6. 📊 Native HTML5 Canvas Charts & Executive Reports
- **Stock by Group Bar Chart**: Custom canvas bar chart with safety threshold line.
- **Component Distribution Donut Chart**: Breakdown of PRBC, WB, Platelets, Plasma, and Cryoprecipitate.
- **Monthly Transfusion Trends**: Area/line comparison of collections vs. hospital demand.
- **Printable Medical Report**: Fully styled for paper printing (`@media print`).

### 7. 🔒 Compliance & Governance
- **Immutable Audit Trail**: Logs every stock addition, status update, emergency dispatch, and disposal with timestamps and operator identity.
- **Role Switcher**: Seamlessly switch between *Blood Bank Director*, *Hospital Physician*, *Registered Donor*, and *Public Visitor*.
- **Theme Switcher**: Crisp clinical light mode & high-contrast dark mode.
- **Data Persistence**: Uses reactive `localStorage` state management with a one-click demo data reset option.

---

## 💻 How to Run

1. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).
2. No Node.js build steps, npm installs, or internet connection required.

---

## 📁 Project Structure

```text
├── index.html           # Main Single Page Application shell
├── css/
│   └── styles.css       # Design system, themes, components, modals, print styles
├── js/
│   ├── data.js          # Seed dataset, blood compatibility matrices, clinical rules
│   ├── store.js         # Reactive localStorage state management & compatibility matching
│   ├── charts.js        # Standalone HTML5 Canvas charts (Bar, Donut, Line/Area)
│   └── app.js           # UI controllers, view router, modals, and event handlers
└── README.md            # System documentation
```
