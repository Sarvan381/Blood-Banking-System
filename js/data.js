/**
 * Blood Banking System - Data & Domain Rules (Indian Healthcare Context)
 * Provides comprehensive mock datasets and medical compatibility matrix.
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
    rarity: '2% in India (Rare Universal Red Cell Donor)'
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    rarity: '37% in India (Most Common)'
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    rarity: '1% in India'
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    rarity: '21% in India'
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    rarity: '2% in India'
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    rarity: '32% in India (Very High Prevalence)'
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    rarity: '0.5% in India (Extremely Rare)'
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal recipient
    rarity: '4.5% in India (Universal Recipient)'
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
    { id: 'CEN-01', name: 'Rotary Central Blood Bank', city: 'New Delhi', address: 'Plot 56, Tughlakabad Institutional Area, New Delhi - 110062', phone: '+91 11 2995 5650', emergencyContact: '1910 (National Toll-Free)', capacityUnits: 2500 },
    { id: 'CEN-02', name: 'Indian Red Cross Society Regional Center', city: 'New Delhi', address: '1, Red Cross Road, Parliament Street, New Delhi - 110001', phone: '+91 11 2371 6441', emergencyContact: '104 (Health Helpline)', capacityUnits: 1800 },
    { id: 'CEN-03', name: 'Rashtrotthana Blood Centre', city: 'Bengaluru', address: 'Gavipuram Guttahalli, Kempegowda Nagar, Bengaluru, Karnataka - 560019', phone: '+91 80 2661 2730', emergencyContact: '108 (Trauma Emergency)', capacityUnits: 1500 },
    { id: 'CEN-04', name: 'Lions Blood Bank & Transfusion Research', city: 'Mumbai', address: 'Lions Service Centre, Andheri West, Mumbai, Maharashtra - 400058', phone: '+91 22 2623 8890', emergencyContact: '+91 98200 10810', capacityUnits: 1200 }
  ],

  hospitals: [
    { id: 'HOSP-01', name: 'AIIMS Trauma Centre (JPNATC)', code: 'AIIMS-TC', department: 'Emergency Trauma Surgery', contactPerson: 'Dr. Rajeshwar Iyer (Head of Hematology)', phone: '+91 11 2618 8000' },
    { id: 'HOSP-02', name: 'Apollo Hospitals Bannerghatta', code: 'APOLLO-BLR', department: 'Cardiothoracic Surgery ICU', contactPerson: 'Dr. Sunita Kulkarni (Blood Bank In-Charge)', phone: '+91 80 2630 4050' },
    { id: 'HOSP-03', name: 'Tata Memorial Hospital (ACTREC)', code: 'TMH-MUM', department: 'Pediatric Oncology & Hematology', contactPerson: 'Dr. Arvind Swaminathan', phone: '+91 22 2417 7000' },
    { id: 'HOSP-04', name: 'Christian Medical College (CMC)', code: 'CMC-VLR', department: 'Obstetrics & Acute Trauma Care', contactPerson: 'Dr. Ananya Mukherjee', phone: '+91 416 228 1000' }
  ],

  donors: [
    {
      id: 'DON-1001',
      name: 'Rohan Sharma',
      email: 'rohan.sharma92@gmail.com',
      phone: '+91 98102 44321',
      bloodGroup: 'O-',
      gender: 'Male',
      dob: '1992-04-14',
      weightKg: 76,
      address: 'Flat 402, Shivalik Enclave, Sector 62, Noida, Uttar Pradesh',
      totalDonations: 14,
      lastDonationDate: daysFromNow(-110),
      eligible: true,
      badge: 'Platinum Hero',
      notes: 'Universal O- donor; responds immediately to STAT highway trauma calls.',
      medicalCleared: true
    },
    {
      id: 'DON-1002',
      name: 'Priya Patel',
      email: 'priya.patel@rediffmail.com',
      phone: '+91 98205 11984',
      bloodGroup: 'A+',
      gender: 'Female',
      dob: '1996-08-22',
      weightKg: 60,
      address: 'B-14, Neelkanth Valley, Ghatkopar East, Mumbai, Maharashtra',
      totalDonations: 6,
      lastDonationDate: daysFromNow(-45),
      eligible: false, // Female 120-day interval not completed yet
      badge: 'Silver Donor',
      notes: 'Eligible again in 75 days.',
      medicalCleared: true
    },
    {
      id: 'DON-1003',
      name: 'Vikram Malhotra',
      email: 'v.malhotra@outlook.in',
      phone: '+91 98765 89210',
      bloodGroup: 'B+',
      gender: 'Male',
      dob: '1988-11-03',
      weightKg: 82,
      address: '78/4, Indiranagar 100ft Road, Bengaluru, Karnataka',
      totalDonations: 20,
      lastDonationDate: daysFromNow(-98),
      eligible: true,
      badge: 'Gold Life Saver',
      notes: 'Frequent platelet apheresis donor.',
      medicalCleared: true
    },
    {
      id: 'DON-1004',
      name: 'Dr. Meenakshi Sundaram',
      email: 'meenakshi.sundaram@aiims.edu.in',
      phone: '+91 94441 23098',
      bloodGroup: 'AB+',
      gender: 'Female',
      dob: '1990-02-18',
      weightKg: 58,
      address: '12, Temple View Avenue, Mylapore, Chennai, Tamil Nadu',
      totalDonations: 11,
      lastDonationDate: daysFromNow(-135),
      eligible: true,
      badge: 'Gold Life Saver',
      notes: 'Universal plasma donor; AIIMS faculty member.',
      medicalCleared: true
    },
    {
      id: 'DON-1005',
      name: 'Arjun Reddy',
      email: 'arjun.reddy88@gmail.com',
      phone: '+91 98490 55123',
      bloodGroup: 'O+',
      gender: 'Male',
      dob: '1999-07-30',
      weightKg: 74,
      address: 'Plot 45, Jubilee Hills Checkpost, Road No. 36, Hyderabad, Telangana',
      totalDonations: 5,
      lastDonationDate: daysFromNow(-100),
      eligible: true,
      badge: 'Bronze Donor',
      notes: 'Active volunteer in collegiate blood drives.',
      medicalCleared: true
    },
    {
      id: 'DON-1006',
      name: 'Sneha Sengupta',
      email: 'sneha.sengupta@calcuttauniv.ac.in',
      phone: '+91 98301 67890',
      bloodGroup: 'AB-',
      gender: 'Female',
      dob: '1995-12-10',
      weightKg: 62,
      address: 'Block CD, Salt Lake Sector 1, Bidhannagar, Kolkata, West Bengal',
      totalDonations: 8,
      lastDonationDate: daysFromNow(-150),
      eligible: true,
      badge: 'Silver Donor',
      notes: 'Rare AB- group. Registered for rapid Kolkata regional callout.',
      medicalCleared: true
    },
    {
      id: 'DON-1007',
      name: 'Harpreet Singh Chawla',
      email: 'h.chawla@punjabmail.com',
      phone: '+91 98150 99821',
      bloodGroup: 'B-',
      gender: 'Male',
      dob: '1985-05-19',
      weightKg: 84,
      address: '312, Model Town Extension, Ludhiana, Punjab',
      totalDonations: 16,
      lastDonationDate: daysFromNow(-92),
      eligible: true,
      badge: 'Platinum Hero',
      notes: 'Rare B- donor. Key contributor to North Zone emergency pool.',
      medicalCleared: true
    },
    {
      id: 'DON-1008',
      name: 'Ananya Verma',
      email: 'ananya.verma@iitd.ac.in',
      phone: '+91 97118 45672',
      bloodGroup: 'A-',
      gender: 'Female',
      dob: '2001-09-02',
      weightKg: 55,
      address: 'Hostel Kailash, IIT Delhi Campus, Hauz Khas, New Delhi',
      totalDonations: 3,
      lastDonationDate: daysFromNow(-140),
      eligible: true,
      badge: 'Bronze Donor',
      notes: 'Registered during IIT Delhi NSS Blood Donation Camp.',
      medicalCleared: true
    }
  ],

  // 45 pre-seeded blood bags with cold chain shelf tracking
  inventory: [
    // O- Units (Universal critical reserve)
    { id: 'BAG-2026-0101', bloodGroup: 'O-', component: 'PRBC', volumeMl: 320, collectedDate: daysFromNow(-14), expiryDate: daysFromNow(28), centerId: 'CEN-01', location: 'Cold Refrigerator A-01 (Shelf 1)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0102', bloodGroup: 'O-', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-20), expiryDate: daysFromNow(22), centerId: 'CEN-01', location: 'Cold Refrigerator A-01 (Shelf 1)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0103', bloodGroup: 'O-', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-5), expiryDate: daysFromNow(30), centerId: 'CEN-02', location: 'Cold Refrigerator B-02 (Shelf 2)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0104', bloodGroup: 'O-', component: 'PLT', volumeMl: 240, collectedDate: daysFromNow(-2), expiryDate: daysFromNow(3), centerId: 'CEN-01', location: 'Platelet Agitator AG-1', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0105', bloodGroup: 'O-', component: 'FFP', volumeMl: 260, collectedDate: daysFromNow(-40), expiryDate: daysFromNow(325), centerId: 'CEN-03', location: 'Deep Freezer DF-1 (-40°C)', status: 'Available', donorId: 'DON-1001', screening: 'Passed' },

    // O+ Units (High demand)
    { id: 'BAG-2026-0201', bloodGroup: 'O+', component: 'PRBC', volumeMl: 315, collectedDate: daysFromNow(-10), expiryDate: daysFromNow(32), centerId: 'CEN-01', location: 'Cold Refrigerator A-02 (Shelf 1)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0202', bloodGroup: 'O+', component: 'PRBC', volumeMl: 300, collectedDate: daysFromNow(-18), expiryDate: daysFromNow(24), centerId: 'CEN-01', location: 'Cold Refrigerator A-02 (Shelf 2)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0203', bloodGroup: 'O+', component: 'PRBC', volumeMl: 305, collectedDate: daysFromNow(-38), expiryDate: daysFromNow(4), centerId: 'CEN-02', location: 'Cold Refrigerator A-03 (Shelf 1)', status: 'Expiring Soon', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0204', bloodGroup: 'O+', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-12), expiryDate: daysFromNow(23), centerId: 'CEN-02', location: 'Cold Refrigerator B-01 (Shelf 1)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0205', bloodGroup: 'O+', component: 'PLT', volumeMl: 250, collectedDate: daysFromNow(-3), expiryDate: daysFromNow(2), centerId: 'CEN-01', location: 'Platelet Agitator AG-1', status: 'Expiring Soon', donorId: 'DON-1005', screening: 'Passed' },
    { id: 'BAG-2026-0206', bloodGroup: 'O+', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-60), expiryDate: daysFromNow(305), centerId: 'CEN-01', location: 'Deep Freezer DF-1 (-40°C)', status: 'Available', donorId: 'DON-1005', screening: 'Passed' },

    // A+ Units
    { id: 'BAG-2026-0301', bloodGroup: 'A+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-8), expiryDate: daysFromNow(34), centerId: 'CEN-01', location: 'Cold Refrigerator A-03 (Shelf 2)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0302', bloodGroup: 'A+', component: 'PRBC', volumeMl: 320, collectedDate: daysFromNow(-15), expiryDate: daysFromNow(27), centerId: 'CEN-02', location: 'Cold Refrigerator A-03 (Shelf 3)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0303', bloodGroup: 'A+', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-6), expiryDate: daysFromNow(29), centerId: 'CEN-03', location: 'Cold Refrigerator B-02 (Shelf 1)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0304', bloodGroup: 'A+', component: 'PLT', volumeMl: 255, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(4), centerId: 'CEN-01', location: 'Platelet Agitator AG-2', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0305', bloodGroup: 'A+', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-30), expiryDate: daysFromNow(335), centerId: 'CEN-01', location: 'Deep Freezer DF-2 (-40°C)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },
    { id: 'BAG-2026-0306', bloodGroup: 'A+', component: 'CRYO', volumeMl: 20, collectedDate: daysFromNow(-25), expiryDate: daysFromNow(340), centerId: 'CEN-02', location: 'Deep Freezer DF-2 (-40°C)', status: 'Available', donorId: 'DON-1002', screening: 'Passed' },

    // A- Units
    { id: 'BAG-2026-0401', bloodGroup: 'A-', component: 'PRBC', volumeMl: 300, collectedDate: daysFromNow(-12), expiryDate: daysFromNow(30), centerId: 'CEN-01', location: 'Cold Refrigerator A-04 (Shelf 1)', status: 'Available', donorId: 'DON-1008', screening: 'Passed' },
    { id: 'BAG-2026-0402', bloodGroup: 'A-', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-14), expiryDate: daysFromNow(21), centerId: 'CEN-02', location: 'Cold Refrigerator B-03 (Shelf 1)', status: 'Available', donorId: 'DON-1008', screening: 'Passed' },
    { id: 'BAG-2026-0403', bloodGroup: 'A-', component: 'FFP', volumeMl: 245, collectedDate: daysFromNow(-45), expiryDate: daysFromNow(320), centerId: 'CEN-03', location: 'Deep Freezer DF-1 (-40°C)', status: 'Available', donorId: 'DON-1008', screening: 'Passed' },

    // B+ Units (High prevalence in India)
    { id: 'BAG-2026-0501', bloodGroup: 'B+', component: 'PRBC', volumeMl: 325, collectedDate: daysFromNow(-9), expiryDate: daysFromNow(33), centerId: 'CEN-01', location: 'Cold Refrigerator B-01 (Shelf 2)', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },
    { id: 'BAG-2026-0502', bloodGroup: 'B+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-22), expiryDate: daysFromNow(20), centerId: 'CEN-02', location: 'Cold Refrigerator B-01 (Shelf 3)', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },
    { id: 'BAG-2026-0503', bloodGroup: 'B+', component: 'PLT', volumeMl: 260, collectedDate: daysFromNow(-2), expiryDate: daysFromNow(3), centerId: 'CEN-01', location: 'Platelet Agitator AG-2', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },
    { id: 'BAG-2026-0504', bloodGroup: 'B+', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-50), expiryDate: daysFromNow(315), centerId: 'CEN-03', location: 'Deep Freezer DF-2 (-40°C)', status: 'Available', donorId: 'DON-1003', screening: 'Passed' },

    // B- Units (Rare)
    { id: 'BAG-2026-0601', bloodGroup: 'B-', component: 'PRBC', volumeMl: 315, collectedDate: daysFromNow(-16), expiryDate: daysFromNow(26), centerId: 'CEN-01', location: 'Cold Refrigerator B-04 (Shelf 1)', status: 'Available', donorId: 'DON-1007', screening: 'Passed' },
    { id: 'BAG-2026-0602', bloodGroup: 'B-', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-11), expiryDate: daysFromNow(24), centerId: 'CEN-03', location: 'Cold Refrigerator B-04 (Shelf 2)', status: 'Available', donorId: 'DON-1007', screening: 'Passed' },

    // AB+ Units (Universal plasma)
    { id: 'BAG-2026-0701', bloodGroup: 'AB+', component: 'PRBC', volumeMl: 300, collectedDate: daysFromNow(-7), expiryDate: daysFromNow(35), centerId: 'CEN-02', location: 'Cold Refrigerator C-01 (Shelf 1)', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },
    { id: 'BAG-2026-0702', bloodGroup: 'AB+', component: 'FFP', volumeMl: 270, collectedDate: daysFromNow(-20), expiryDate: daysFromNow(345), centerId: 'CEN-01', location: 'Deep Freezer DF-1 (-40°C)', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },
    { id: 'BAG-2026-0703', bloodGroup: 'AB+', component: 'FFP', volumeMl: 260, collectedDate: daysFromNow(-35), expiryDate: daysFromNow(330), centerId: 'CEN-01', location: 'Deep Freezer DF-1 (-40°C)', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },
    { id: 'BAG-2026-0704', bloodGroup: 'AB+', component: 'PLT', volumeMl: 250, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(4), centerId: 'CEN-01', location: 'Platelet Agitator AG-1', status: 'Available', donorId: 'DON-1004', screening: 'Passed' },

    // AB- Units (Rarest in India)
    { id: 'BAG-2026-0801', bloodGroup: 'AB-', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-10), expiryDate: daysFromNow(32), centerId: 'CEN-01', location: 'Cold Refrigerator C-02 (Shelf 1)', status: 'Available', donorId: 'DON-1006', screening: 'Passed' },
    { id: 'BAG-2026-0802', bloodGroup: 'AB-', component: 'FFP', volumeMl: 250, collectedDate: daysFromNow(-40), expiryDate: daysFromNow(325), centerId: 'CEN-03', location: 'Deep Freezer DF-2 (-40°C)', status: 'Available', donorId: 'DON-1006', screening: 'Passed' },

    // Quarantined / In-Testing Bags
    { id: 'BAG-2026-0901', bloodGroup: 'O+', component: 'WB', volumeMl: 450, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(34), centerId: 'CEN-01', location: 'Testing Quarantine Bay Q-1', status: 'Testing / Quarantine', donorId: 'DON-1005', screening: 'Pending Serology / NAT' },
    { id: 'BAG-2026-0902', bloodGroup: 'A+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-1), expiryDate: daysFromNow(41), centerId: 'CEN-02', location: 'Testing Quarantine Bay Q-2', status: 'Testing / Quarantine', donorId: 'DON-1002', screening: 'Pending NAT' },

    // Reserved Bags for Active Hospital Orders
    { id: 'BAG-2026-0903', bloodGroup: 'O-', component: 'PRBC', volumeMl: 315, collectedDate: daysFromNow(-10), expiryDate: daysFromNow(32), centerId: 'CEN-01', location: 'Dispatch Hold D-1 (Insulated Box)', status: 'Reserved', donorId: 'DON-1001', screening: 'Passed' },
    { id: 'BAG-2026-0904', bloodGroup: 'B+', component: 'PRBC', volumeMl: 310, collectedDate: daysFromNow(-14), expiryDate: daysFromNow(28), centerId: 'CEN-01', location: 'Dispatch Hold D-2 (Insulated Box)', status: 'Reserved', donorId: 'DON-1003', screening: 'Passed' }
  ],

  requests: [
    {
      id: 'REQ-2026-4401',
      hospitalId: 'HOSP-01',
      hospitalName: 'AIIMS Trauma Centre (JPNATC)',
      patientName: 'Ramesh Chandra (Trauma ICU Bay 3)',
      bloodGroup: 'O-',
      component: 'PRBC',
      unitsRequested: 3,
      unitsAllocated: 2,
      urgency: 'STAT / Critical (Under 1 hr)',
      urgencyLevel: 'CRITICAL',
      status: 'In-Transit',
      requestDate: '2026-09-24T08:15:00',
      etaMinutes: 18,
      reason: 'NH-48 highway multi-vehicle collision trauma with hemorrhagic shock',
      doctor: 'Dr. Rajeshwar Iyer',
      assignedCenter: 'Rotary Central Blood Bank',
      allocatedBagIds: ['BAG-2026-0903']
    },
    {
      id: 'REQ-2026-4402',
      hospitalId: 'HOSP-02',
      hospitalName: 'Apollo Hospitals Bannerghatta',
      patientName: 'Kavitha Krishnan (Age 54)',
      bloodGroup: 'B+',
      component: 'PRBC',
      unitsRequested: 2,
      unitsAllocated: 2,
      urgency: 'Urgent (Within 4 hrs)',
      urgencyLevel: 'URGENT',
      status: 'Approved',
      requestDate: '2026-09-24T09:30:00',
      etaMinutes: 45,
      reason: 'Emergency off-pump coronary artery bypass graft (CABG)',
      doctor: 'Dr. Sunita Kulkarni',
      assignedCenter: 'Rashtrotthana Blood Centre',
      allocatedBagIds: ['BAG-2026-0904']
    },
    {
      id: 'REQ-2026-4403',
      hospitalId: 'HOSP-03',
      hospitalName: 'Tata Memorial Hospital (ACTREC)',
      patientName: 'Master Aarav Deshmukh (Age 8)',
      bloodGroup: 'A+',
      component: 'PLT',
      unitsRequested: 2,
      unitsAllocated: 0,
      urgency: 'Urgent (Within 4 hrs)',
      urgencyLevel: 'URGENT',
      status: 'Pending Verification',
      requestDate: '2026-09-24T10:05:00',
      reason: 'Acute lymphoblastic leukemia with severe thrombocytopenia (Platelets < 15,000)',
      doctor: 'Dr. Arvind Swaminathan',
      assignedCenter: 'Lions Blood Bank & Transfusion Research',
      allocatedBagIds: []
    },
    {
      id: 'REQ-2026-4404',
      hospitalId: 'HOSP-04',
      hospitalName: 'Christian Medical College (CMC)',
      patientName: 'Deepika Natarajan',
      bloodGroup: 'AB-',
      component: 'FFP',
      unitsRequested: 1,
      unitsAllocated: 1,
      urgency: 'Routine (Within 24 hrs)',
      urgencyLevel: 'ROUTINE',
      status: 'Delivered',
      requestDate: '2026-09-23T14:20:00',
      reason: 'Postpartum obstetric hemorrhage DIC management protocol',
      doctor: 'Dr. Ananya Mukherjee',
      assignedCenter: 'Indian Red Cross Society Regional Center',
      allocatedBagIds: ['BAG-2026-0802']
    }
  ],

  camps: [
    {
      id: 'CAMP-301',
      title: 'National Voluntary Blood Donation Day Mega Drive',
      organizer: 'Indian Red Cross Society & Rotary Club Delhi Central',
      date: '2026-09-28',
      time: '09:00 AM - 05:00 PM',
      venue: 'Connaught Place Central Park Atrium, New Delhi - 110001',
      targetUnits: 250,
      registeredCount: 184,
      status: 'Upcoming',
      contactPhone: '+91 11 2371 6441'
    },
    {
      id: 'CAMP-302',
      title: 'IISc & Bengaluru Tech Corridors LifeSaver Camp',
      organizer: 'Youth Red Cross Karnataka & Rashtrotthana Parishat',
      date: '2026-10-03',
      time: '10:00 AM - 04:30 PM',
      venue: 'Faculty Hall Quadrangle, IISc Campus, Malleshwaram, Bengaluru - 560012',
      targetUnits: 150,
      registeredCount: 112,
      status: 'Upcoming',
      contactPhone: '+91 80 2293 2004'
    },
    {
      id: 'CAMP-303',
      title: 'Cyber City Corporate Bloodathon',
      organizer: 'Lions Blood Bank & DLF Foundation',
      date: '2026-10-12',
      time: '08:30 AM - 04:00 PM',
      venue: 'Cyber Hub Amphitheatre, DLF Phase 2, Gurugram, Haryana - 122002',
      targetUnits: 200,
      registeredCount: 88,
      status: 'Upcoming',
      contactPhone: '+91 124 456 7890'
    }
  ],

  appointments: [
    { id: 'APT-501', donorName: 'Rohan Sharma', donorPhone: '+91 98102 44321', bloodGroup: 'O-', centerName: 'Rotary Central Blood Bank', date: '2026-09-26', timeSlot: '10:30 AM', status: 'Confirmed' },
    { id: 'APT-502', donorName: 'Vikram Malhotra', donorPhone: '+91 98765 89210', bloodGroup: 'B+', centerName: 'Rashtrotthana Blood Centre', date: '2026-09-27', timeSlot: '02:00 PM', status: 'Confirmed' }
  ],

  auditLogs: [
    { timestamp: '2026-09-24 08:25', user: 'Dr. Rajeshwar Iyer', action: 'DISPATCH', details: 'Dispatched 2 units O- PRBC to AIIMS Trauma Centre for STAT Code Red request REQ-2026-4401' },
    { timestamp: '2026-09-24 09:35', user: 'Staff Kavita Nair', action: 'APPROVE', details: 'Approved request REQ-2026-4402 (2 units B+ PRBC) for Apollo Hospitals Bannerghatta' },
    { timestamp: '2026-09-24 10:10', user: 'System (NBTC Monitor)', action: 'ALERT', details: 'National inventory alert: O- stock below emergency threshold (5 units remaining)' },
    { timestamp: '2026-09-24 10:30', user: 'Dr. Arvind Swaminathan', action: 'REQUEST', details: 'Filed urgent emergency request REQ-2026-4403 for 2 units A+ Platelets (Tata Memorial Hospital)' }
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
