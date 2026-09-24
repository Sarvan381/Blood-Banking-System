/**
 * Blood Banking System - Data & Domain Rules
 * Provides initial mock datasets and medical compatibility matrix.
 */

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BLOOD_COMPONENTS = {
  PRBC: { name: 'Packed Red Blood Cells', code: 'PRBC', defaultVolume: 300, shelfLifeDays: 42, temp: '2°C to 6°C' },
  WB: { name: 'Whole Blood', code: 'WB', defaultVolume: 450, shelfLifeDays: 35, temp: '2°C to 6°C' },
  PLT: { name: 'Platelets (Single Donor/Random)', code: 'PLT', defaultVolume: 250, shelfLifeDays: 5, temp: '20°C to 24°C' },
  FFP: { name: 'Fresh Frozen Plasma', code: 'FFP', defaultVolume: 250, shelfLifeDays: 365, temp: '-18°C or below' },
  CRYO: { name: 'Cryoprecipitate', code: 'CRYO', defaultVolume: 15, shelfLifeDays: 365, temp: '-18°C or below' }
};

// Red Blood Cell (RBC) Compatibility Matrix
const RBC_COMPATIBILITY = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
    canReceiveFrom: ['O-'],
    rarity: '7% (Universal Red Cell Donor)'
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    rarity: '37% (Most Common)'
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    rarity: '6%'
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    rarity: '34%'
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    rarity: '2% (Rare)'
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    rarity: '10%'
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    rarity: '1% (Very Rare)'
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal recipient
    rarity: '3% (Universal Recipient)'
  }
};

// Plasma Compatibility Matrix (Opposite of RBC)
const PLASMA_COMPATIBILITY = {
  'AB+': { canGiveTo: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], canReceiveFrom: ['AB+'] }, // Universal Plasma Donor
  'AB-': { canGiveTo: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], canReceiveFrom: ['AB+', 'AB-'] },
  'A+': { canGiveTo: ['A+', 'A-', 'O+', 'O-'], canReceiveFrom: ['A+', 'AB+'] },
  'A-': { canGiveTo: ['A+', 'A-', 'O+', 'O-'], canReceiveFrom: ['A+', 'A-', 'AB+', 'AB-'] },
  'B+': { canGiveTo: ['B+', 'B-', 'O+', 'O-'], canReceiveFrom: ['B+', 'AB+'] },
  'B-': { canGiveTo: ['B+', 'B-', 'O+', 'O-'], canReceiveFrom: ['B+', 'B-', 'AB+', 'AB-'] },
  'O+': { canGiveTo: ['O+', 'O-'], canReceiveFrom: ['O+', 'A+', 'B+', 'AB+'] },
  'O-': { canGiveTo: ['O+', 'O-'], canReceiveFrom: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] }
};

// Helper date generator relative to today (2026-09-24)
function daysFromNow(days) {
  const d = new Date('2026-09-24T10:00:00Z');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const SEED_DATA = {
  centers: [
    { id: 'CEN-01', name: 'Metro Central Blood Bank', city: 'Metropolis', address: '450 Healthcare Ave, Medical District', phone: '+1 (555) 019-2831', emergencyContact: '+1 (555) 911-BLOD', capacityUnits: 1500 },
    { id: 'CEN-02', name: 'St. Jude Regional Blood Center', city: 'Metropolis', address: '128 Hope Way, East Wing', phone: '+1 (555) 024-9988', emergencyContact: '+1 (555) 911-8822', capacityUnits: 900 },
    { id: 'CEN-03', name: 'Apex Trauma & Transfusion Hub', city: 'Riverdale', address: '88 North Expressway, Suite 4', phone: '+1 (555) 039-4411', emergencyContact: '+1 (555) 911-4400', capacityUnits: 1200 }
  ],

  hospitals: [
    { id: 'HOSP-01', name: 'City Memorial Hospital', code: 'CMH', department: 'Emergency Trauma Center', contactPerson: 'Dr. Sarah Lin (Chief of Hematology)', phone: '+1 (555) 123-4567' },
    { id: 'HOSP-02', name: 'Apex Heart & Surgical Institute', code: 'AHSI', department: 'Cardiothoracic Surgery ICU', contactPerson: 'Dr. Marcus Vance (Blood Bank Officer)', phone: '+1 (555) 234-5678' },
    { id: 'HOSP-03', name: 'St. Luke Children’s Specialty Hospital', code: 'SLCH', department: 'Pediatric Oncology & ICU', contactPerson: 'Dr. Elena Rostova', phone: '+1 (555) 345-6789' },
    { id: 'HOSP-04', name: 'Riverdale General Hospital', code: 'RGH', department: 'Obstetrics & Acute Care', contactPerson: 'Dr. James Thorne', phone: '+1 (555) 456-7890' }
  ],

  donors: [
    {
      id: 'DON-1001',
      name: 'Alexander Reed',
      email: 'a.reed@example.com',
      phone: '+1 (555) 891-2301',
      bloodGroup: 'O-',
      gender: 'Male',
      dob: '1992-04-14',
      weightKg: 78,
      address: '742 Evergreen Terrace, Metropolis',
      totalDonations: 12,
      lastDonationDate: daysFromNow(-110),
      eligible: true,
      badge: 'Platinum Hero',
      notes: 'Universal O- donor; responds rapidly to STAT trauma calls.',
      medicalCleared: true
    },
    {
      id: 'DON-1002',
      name: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 782-4412',
      bloodGroup: 'A+',
      gender: 'Female',
      dob: '1996-08-22',
      weightKg: 62,
      address: '32 Pinecrest Way, Metropolis',
      totalDonations: 6,
      lastDonationDate: daysFromNow(-45),
      eligible: false, // Female 120-day interval not met yet
      badge: 'Silver Donor',
      notes: 'Eligible again in 75 days.',
      medicalCleared: true
    },
    {
      id: 'DON-1003',
      name: 'Marcus Brody',
      email: 'm.brody@example.com',
      phone: '+1 (555) 673-9934',
      bloodGroup: 'B+',
      gender: 'Male',
      dob: '1988-11-03',
      weightKg: 85,
      address: '15 Highline St, Riverdale',
      totalDonations: 18,
      lastDonationDate: daysFromNow(-98),
      eligible: true,
      badge: 'Gold Life Saver',
      notes: 'Frequent platelet donor.',
      medicalCleared: true
    },
    {
      id: 'DON-1004',
      name: 'Dr. Olivia Chen',
      email: 'olivia.chen@example.org',
      phone: '+1 (555) 345-0012',
      bloodGroup: 'AB+',
      gender: 'Female',
      dob: '1990-02-18',
      weightKg: 58,
      address: '89 Willow Lake Dr, Metropolis',
      totalDonations: 9,
      lastDonationDate: daysFromNow(-135),
      eligible: true,
      badge: 'Gold Life Saver',
      notes: 'Universal plasma donor.',
      medicalCleared: true
    },
    {
      id: 'DON-1005',
      name: 'Elijah Vance',
      email: 'e.vance@example.com',
      phone: '+1 (555) 456-1188',
      bloodGroup: 'O+',
      gender: 'Male',
      dob: '1999-07-30',
      weightKg: 73,
      address: '104 Sunset Blvd, Metropolis',
      totalDonations: 4,
      lastDonationDate: daysFromNow(-100),
      eligible: true,
      badge: 'Bronze Donor',
      notes: 'Regular donor at university drives.',
      medicalCleared: true
    },
    {
      id: 'DON-1006',
      name: 'Chloe Davenport',
      email: 'chloe.d@example.com',
      phone: '+1 (555) 234-8844',
      bloodGroup: 'AB-',
      gender: 'Female',
      dob: '1995-12-10',
      weightKg: 64,
      address: '55 Park Row, Riverdale',
      totalDonations: 7,
      lastDonationDate: daysFromNow(-150),
      eligible: true,
      badge: 'Silver Donor',
      notes: 'Rare AB- group. Registered for rapid callout.',
      medicalCleared: true
    },
    {
      id: 'DON-1007',
      name: 'Hassan Al-Mansoor',
      email: 'h.mansoor@example.com',
      phone: '+1 (555) 890-5566',
      bloodGroup: 'B-',
      gender: 'Male',
      dob: '1985-05-19',
      weightKg: 80,
      address: '210 Beacon Hill, Metropolis',
      totalDonations: 15,
      lastDonationDate: daysFromNow(-92),
      eligible: true,
      badge: 'Platinum Hero',
      notes: 'Rare B- donor. Key contributor to regional emergency pool.',
      medicalCleared: true
    },
    {
      id: 'DON-1008',
      name: 'Jessica Taylor',
      email: 'j.taylor@example.com',
      phone: '+1 (555) 321-7789',
      bloodGroup: 'A-',
      gender: 'Female',
      dob: '2001-09-02',
      weightKg: 54,
      address: '402 College Heights, Riverdale',
      totalDonations: 2,
      lastDonationDate: daysFromNow(-140),
      eligible: true,
      badge: 'Bronze Donor',
      notes: 'First joined at campus blood drive.',
      medicalCleared: true
    }
  ],

  // 45 pre-seeded blood bags with various expiry dates and statuses
  inventory: [
    // O- Units (Critical universal reserve)
    { id: 'BAG-2026-0101', bloodGroup: 'O-', component: 'PRBC', volumeMl: 320, collectedDate: daysFromNow(-14), expiryDate: daysFromNow(28), centerId: 'CEN-01', location: 'Fridge A-01 (Shelf 1)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0102', bloodGroup: 'O-', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-20), expiryDate: daysFromNow(22), centerId: 'CEN-01', location: 'Fridge A-01 (Shelf 1)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0103', bloodGroup: 'O-', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-5), expiryDate: daysFromNow(30), centerId: 'CEN-02', location: 'Fridge B-02 (Shelf 2)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0104', bloodGroup: 'O-', component: 'PLT', volumeMl: 240, collectedDate: daysFromNow(-2), expiryDate: daysFromNow(3), centerId: 'CEN-01', location: 'Agitator AG-1', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0105', bloodGroup: 'O-', component: 'FFP', volumeMl: 260, collectedDate: daysFromNow(-40), expiryDate: daysFromNow(325), centerId: 'CEN-03', location: 'Deep Freezer DF-1', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },

    // O+ Units (High volume)
    { id: 'BAG-2026-0201', bloodGroup: 'O+', component: 'PRBC', volumeMl: 315, collectedDate: daysFromNow(-10), expiryDate: daysFromNow(32), centerId: 'CEN-01', location: 'Fridge A-02 (Shelf 1)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0202', bloodGroup: 'O+', component: 'PRBC', volumeMl: 300, collectedDate: daysFromNow(-18), expiryDate: daysFromNow(24), centerId: 'CEN-01', location: 'Fridge A-02 (Shelf 2)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0203', bloodGroup: 'O+', component: 'PRBC', volumeMl: 305, collectedDate: daysFromNow(-38), expiryDate: daysFromNow(4), centerId: 'CEN-02', location: 'Fridge A-03 (Shelf 1)', status: 'Expiring Soon', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0204', bloodGroup: 'O+', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-12), expiryDate: daysFromNow(23), centerId: 'CEN-02', location: 'Fridge B-01 (Shelf 1)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0205', bloodGroup: 'O+', component: 'PLT', volumeMl: 250, collectedDate: daysFromNow(-3), expiryDate: daysFromNow(2), centerId: 'CEN-01', location: 'Agitator AG-1', status: 'Expiring Soon', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0206', bloodGroup: 'O+', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-60), expiryDate: daysFromNow(305), centerId: 'CEN-01', location: 'Deep Freezer DF-1', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },

    // A+ Units
    { id: 'BAG-2026-0301', bloodGroup: 'A+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-8), expiryDate: daysFromNow(34), centerId: 'CEN-01', location: 'Fridge A-03 (Shelf 2)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0302', bloodGroup: 'A+', component: 'PRBC', volumeMl: 320, collectedDate: daysFromNow(-15), expiryDate: daysFromNow(27), centerId: 'CEN-02', location: 'Fridge A-03 (Shelf 3)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0303', bloodGroup: 'A+', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-6), expiryDate: daysFromNow(29), centerId: 'CEN-03', location: 'Fridge B-02 (Shelf 1)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0304', bloodGroup: 'A+', component: 'PLT', volumeMl: 255, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(4), centerId: 'CEN-01', location: 'Agitator AG-2', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0305', bloodGroup: 'A+', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-30), expiryDate: daysFromNow(335), centerId: 'CEN-01', location: 'Deep Freezer DF-2', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0306', bloodGroup: 'A+', component: 'CRYO', volumeMl: 20, collectedDate: daysFromNow(-25), expiryDate: daysFromNow(340), centerId: 'CEN-02', location: 'Deep Freezer DF-2', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },

    // A- Units
    { id: 'BAG-2026-0401', bloodGroup: 'A-', component: 'PRBC', volumeMl: 300, collectedDate: daysFromNow(-12), expiryDate: daysFromNow(30), centerId: 'CEN-01', location: 'Fridge A-04 (Shelf 1)', status: 'Available', donorId: 'DON-1008', screening: 'Passed' },
    { id: 'BAG-2026-0402', bloodGroup: 'A-', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-14), expiryDate: daysFromNow(21), centerId: 'CEN-02', location: 'Fridge B-03 (Shelf 1)', status: 'Available', donorId: 'DON-1008', screening: 'Passed' },
    { id: 'BAG-2026-0403', bloodGroup: 'A-', component: 'FFP', volumeMl: 245, collectedDate: daysFromNow(-45), expiryDate: daysFromNow(320), centerId: 'CEN-03', location: 'Deep Freezer DF-1', status: 'Available', donorId: 'DON-1008', screening: 'Passed' },

    // B+ Units
    { id: 'BAG-2026-0501', bloodGroup: 'B+', component: 'PRBC', volumeMl: 325, collectedDate: daysFromNow(-9), expiryDate: daysFromNow(33), centerId: 'CEN-01', location: 'Fridge B-01 (Shelf 2)', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },
    { id: 'BAG-2026-0502', bloodGroup: 'B+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-22), expiryDate: daysFromNow(20), centerId: 'CEN-02', location: 'Fridge B-01 (Shelf 3)', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },
    { id: 'BAG-2026-0503', bloodGroup: 'B+', component: 'PLT', volumeMl: 260, collectedDate: daysFromNow(-2), expiryDate: daysFromNow(3), centerId: 'CEN-01', location: 'Agitator AG-2', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },
    { id: 'BAG-2026-0504', bloodGroup: 'B+', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-50), expiryDate: daysFromNow(315), centerId: 'CEN-03', location: 'Deep Freezer DF-2', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },

    // B- Units (Rare)
    { id: 'BAG-2026-0601', bloodGroup: 'B-', component: 'PRBC', volumeMl: 315, collectedDate: daysFromNow(-16), expiryDate: daysFromNow(26), centerId: 'CEN-01', location: 'Fridge B-04 (Shelf 1)', status: 'Available', donorId: 'DON-1007', screening: 'Passed' },
    { id: 'BAG-2026-0602', bloodGroup: 'B-', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-11), expiryDate: daysFromNow(24), centerId: 'CEN-03', location: 'Fridge B-04 (Shelf 2)', status: 'Available', donorId: 'DON-1007', screening: 'Passed' },

    // AB+ Units (Universal plasma)
    { id: 'BAG-2026-0701', bloodGroup: 'AB+', component: 'PRBC', volumeMl: 300, collectedDate: daysFromNow(-7), expiryDate: daysFromNow(35), centerId: 'CEN-02', location: 'Fridge C-01 (Shelf 1)', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },
    { id: 'BAG-2026-0702', bloodGroup: 'AB+', component: 'FFP', volumeMl: 270, collectedDate: daysFromNow(-20), expiryDate: daysFromNow(345), centerId: 'CEN-01', location: 'Deep Freezer DF-1', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },
    { id: 'BAG-2026-0703', bloodGroup: 'AB+', component: 'FFP', volumeMl: 260, collectedDate: daysFromNow(-35), expiryDate: daysFromNow(330), centerId: 'CEN-01', location: 'Deep Freezer DF-1', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },
    { id: 'BAG-2026-0704', bloodGroup: 'AB+', component: 'PLT', volumeMl: 250, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(4), centerId: 'CEN-01', location: 'Agitator AG-1', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },

    // AB- Units (Rarest)
    { id: 'BAG-2026-0801', bloodGroup: 'AB-', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-10), expiryDate: daysFromNow(32), centerId: 'CEN-01', location: 'Fridge C-02 (Shelf 1)', status: 'Available', donorId: 'DON-1006', screening: 'Passed' },
    { id: 'BAG-2026-0802', bloodGroup: 'AB-', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-40), expiryDate: daysFromNow(325), centerId: 'CEN-03', location: 'Deep Freezer DF-2', status: 'Available', donorId: 'DON-1006', screening: 'Passed' },

    // Quarantined / In-Testing Bags
    { id: 'BAG-2026-0901', bloodGroup: 'O+', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(34), centerId: 'CEN-01', location: 'Quarantine Bay Q-1', status: 'Testing / Quarantine', donorId: 'DON-1005', screening: 'Pending Serology' },
    { id: 'BAG-2026-0902', bloodGroup: 'A+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(41), centerId: 'CEN-02', location: 'Quarantine Bay Q-2', status: 'Testing / Quarantine', donorId: 'DON-1002', screening: 'Pending NAT' },

    // Reserved Bags for Active Hospital Orders
    { id: 'BAG-2026-0903', bloodGroup: 'O-', component: 'PRBC', volumeMl: 315, collectedDate: daysFromNow(-10), expiryDate: daysFromNow(32), centerId: 'CEN-01', location: 'Dispatch Hold D-1', status: 'Reserved', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0904', bloodGroup: 'B+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-14), expiryDate: daysFromNow(28), centerId: 'CEN-01', location: 'Dispatch Hold D-2', status: 'Reserved', donorId: 'DON-1003', screening: 'Passed' }
  ],

  requests: [
    {
      id: 'REQ-2026-4401',
      hospitalId: 'HOSP-01',
      hospitalName: 'City Memorial Hospital',
      patientName: 'David K. (Trauma Bay 4)',
      bloodGroup: 'O-',
      component: 'PRBC',
      unitsRequested: 3,
      unitsAllocated: 2,
      urgency: 'STAT / Critical (Under 1 hr)',
      urgencyLevel: 'CRITICAL',
      status: 'In-Transit',
      requestDate: '2026-09-24T08:15:00',
      etaMinutes: 18,
      reason: 'Multi-vehicle collision with severe hypovolemic shock',
      doctor: 'Dr. Sarah Lin',
      assignedCenter: 'Metro Central Blood Bank',
      allocatedBagIds: ['BAG-2026-0903']
    },
    {
      id: 'REQ-2026-4402',
      hospitalId: 'HOSP-02',
      hospitalName: 'Apex Heart & Surgical Institute',
      patientName: 'Eleanor Gray',
      bloodGroup: 'B+',
      component: 'PRBC',
      unitsRequested: 2,
      unitsAllocated: 2,
      urgency: 'Urgent (Within 4 hrs)',
      urgencyLevel: 'URGENT',
      status: 'Approved',
      requestDate: '2026-09-24T09:30:00',
      etaMinutes: 65,
      reason: 'Emergency coronary artery bypass graft (CABG)',
      doctor: 'Dr. Marcus Vance',
      assignedCenter: 'Metro Central Blood Bank',
      allocatedBagIds: ['BAG-2026-0904']
    },
    {
      id: 'REQ-2026-4403',
      hospitalId: 'HOSP-03',
      hospitalName: 'St. Luke Children’s Hospital',
      patientName: 'Lucas M. (Age 7)',
      bloodGroup: 'A+',
      component: 'PLT',
      unitsRequested: 2,
      unitsAllocated: 0,
      urgency: 'Urgent (Within 4 hrs)',
      urgencyLevel: 'URGENT',
      status: 'Pending Verification',
      requestDate: '2026-09-24T10:05:00',
      reason: 'Acute lymphoblastic leukemia with severe thrombocytopenia',
      doctor: 'Dr. Elena Rostova',
      assignedCenter: 'St. Jude Regional Blood Center',
      allocatedBagIds: []
    },
    {
      id: 'REQ-2026-4404',
      hospitalId: 'HOSP-04',
      hospitalName: 'Riverdale General Hospital',
      patientName: 'Maya Patel',
      bloodGroup: 'AB-',
      component: 'FFP',
      unitsRequested: 1,
      unitsAllocated: 1,
      urgency: 'Routine (Within 24 hrs)',
      urgencyLevel: 'ROUTINE',
      status: 'Delivered',
      requestDate: '2026-09-23T14:20:00',
      reason: 'Postpartum hemorrhage transfusion protocol',
      doctor: 'Dr. James Thorne',
      assignedCenter: 'Apex Trauma & Transfusion Hub',
      allocatedBagIds: ['BAG-2026-0802']
    }
  ],

  camps: [
    {
      id: 'CAMP-301',
      title: 'City Hall Mega Blood Drive',
      organizer: 'Red Cross & Metropolis Health Dept',
      date: '2026-09-28',
      time: '09:00 AM - 05:00 PM',
      venue: 'Metropolis Civic Center Atrium, 100 Main St',
      targetUnits: 150,
      registeredCount: 94,
      status: 'Upcoming',
      contactPhone: '+1 (555) 300-8800'
    },
    {
      id: 'CAMP-302',
      title: 'University Campus LifeSaver Camp',
      organizer: 'Metropolis Tech Medical Students Association',
      date: '2026-10-03',
      time: '10:00 AM - 04:00 PM',
      venue: 'Student Union Quad, North Campus',
      targetUnits: 100,
      registeredCount: 68,
      status: 'Upcoming',
      contactPhone: '+1 (555) 420-7711'
    },
    {
      id: 'CAMP-303',
      title: 'Riverdale Corporate Park Bloodathon',
      organizer: 'Apex Trauma Center & Tech Alliance',
      date: '2026-10-12',
      time: '08:30 AM - 03:30 PM',
      venue: 'Building 4 Conference Hall, Riverdale',
      targetUnits: 120,
      registeredCount: 42,
      status: 'Upcoming',
      contactPhone: '+1 (555) 909-1234'
    }
  ],

  appointments: [
    { id: 'APT-501', donorName: 'Alexander Reed', donorPhone: '+1 (555) 891-2301', bloodGroup: 'O-', centerName: 'Metro Central Blood Bank', date: '2026-09-26', timeSlot: '10:30 AM', status: 'Confirmed' },
    { id: 'APT-502', donorName: 'Marcus Brody', donorPhone: '+1 (555) 673-9934', bloodGroup: 'B+', centerName: 'Apex Trauma & Transfusion Hub', date: '2026-09-27', timeSlot: '02:00 PM', status: 'Confirmed' }
  ],

  auditLogs: [
    { timestamp: '2026-09-24 08:25', user: 'Admin Lin', action: 'DISPATCH', details: 'Dispatched 2 units O- PRBC to City Memorial Hospital for STAT request REQ-2026-4401' },
    { timestamp: '2026-09-24 09:35', user: 'Staff K. Novak', action: 'APPROVE', details: 'Approved request REQ-2026-4402 (2 units B+ PRBC) for Apex Heart Institute' },
    { timestamp: '2026-09-24 10:10', user: 'System', action: 'ALERT', details: 'Inventory warning: O- stock below safety reserve threshold (5 units remaining)' },
    { timestamp: '2026-09-24 10:30', user: 'Dr. Rostova', action: 'REQUEST', details: 'Filed emergency request REQ-2026-4403 for 2 units A+ Platelets' }
  ]
};

// Export to window
window.BBS_DATA = {
  BLOOD_GROUPS,
  BLOOD_COMPONENTS,
  RBC_COMPATIBILITY,
  PLASMA_COMPATIBILITY,
  SEED_DATA
};
