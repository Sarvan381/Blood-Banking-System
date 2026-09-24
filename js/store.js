/**
 * Blood Banking System - State Management & Storage
 * Handles reactive localStorage persistence, business logic, compatibility checks and audits.
 */

const STORAGE_KEY = 'ANTIGRAVITY_BBS_STATE_V2_IN';

class BloodBankStore {
  constructor() {
    this.listeners = new Map();
    this.init();
  }

  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored state, resetting to seed data.', e);
        this.state = JSON.parse(JSON.stringify(window.BBS_DATA.SEED_DATA));
        this.save();
      }
    } else {
      this.state = JSON.parse(JSON.stringify(window.BBS_DATA.SEED_DATA));
      this.save();
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.emit('change', this.state);
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(window.BBS_DATA.SEED_DATA));
    this.save();
    this.emit('reset', this.state);
  }

  // Event Pub/Sub
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (err) { console.error('Error in subscriber', err); }
      });
    }
  }

  // --- LOGGING ---
  addLog(action, details, user = 'System') {
    const entry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user,
      action,
      details
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 50) this.state.auditLogs.pop();
    this.save();
    this.emit('log', entry);
  }

  // --- INVENTORY OPERATIONS ---
  getInventory(filters = {}) {
    return this.state.inventory.filter(item => {
      if (filters.bloodGroup && item.bloodGroup !== filters.bloodGroup) return false;
      if (filters.component && item.component !== filters.component) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.centerId && item.centerId !== filters.centerId) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = item.id.toLowerCase().includes(q) ||
                      item.bloodGroup.toLowerCase().includes(q) ||
                      item.component.toLowerCase().includes(q) ||
                      (item.location && item.location.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }

  addInventoryUnit(unit) {
    const id = `BAG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUnit = {
      id,
      bloodGroup: unit.bloodGroup,
      component: unit.component || 'PRBC',
      volumeMl: parseInt(unit.volumeMl, 10) || 300,
      collectedDate: unit.collectedDate || new Date().toISOString().split('T')[0],
      expiryDate: unit.expiryDate,
      centerId: unit.centerId || 'CEN-01',
      location: unit.location || 'Fridge A-01 (General)',
      status: unit.status || 'Available',
      donorId: unit.donorId || 'DON-ANON',
      screening: unit.screening || 'Passed'
    };

    // Calculate expiry if not provided
    if (!newUnit.expiryDate) {
      const compInfo = window.BBS_DATA.BLOOD_COMPONENTS[newUnit.component] || { shelfLifeDays: 35 };
      const d = new Date(newUnit.collectedDate);
      d.setDate(d.getDate() + compInfo.shelfLifeDays);
      newUnit.expiryDate = d.toISOString().split('T')[0];
    }

    this.state.inventory.unshift(newUnit);
    this.addLog('STOCK_ADD', `Added unit ${newUnit.id} (${newUnit.bloodGroup} ${newUnit.component})`, unit.addedBy || 'Staff');
    this.save();
    return newUnit;
  }

  updateInventoryUnit(id, updates) {
    const idx = this.state.inventory.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.state.inventory[idx] = { ...this.state.inventory[idx], ...updates };
      this.addLog('STOCK_UPDATE', `Updated unit ${id} status to ${updates.status || 'modified'}`);
      this.save();
      return this.state.inventory[idx];
    }
    return null;
  }

  deleteInventoryUnit(id) {
    const idx = this.state.inventory.findIndex(item => item.id === id);
    if (idx !== -1) {
      const removed = this.state.inventory.splice(idx, 1)[0];
      this.addLog('STOCK_DISCARD', `Discarded/removed unit ${removed.id} (${removed.bloodGroup})`);
      this.save();
      return true;
    }
    return false;
  }

  // --- SMART COMPATIBILITY CHECK & AUTO-ALLOCATION ---
  findCompatibleUnits(patientBloodGroup, component = 'PRBC', requiredUnits = 1) {
    let compatibleGroups = [];
    if (component === 'FFP' || component === 'CRYO') {
      compatibleGroups = window.BBS_DATA.PLASMA_COMPATIBILITY[patientBloodGroup]?.canReceiveFrom || [patientBloodGroup];
    } else {
      compatibleGroups = window.BBS_DATA.RBC_COMPATIBILITY[patientBloodGroup]?.canReceiveFrom || [patientBloodGroup];
    }

    // Available units matching compatible groups & component
    const available = this.state.inventory.filter(item =>
      item.status === 'Available' &&
      item.component === component &&
      compatibleGroups.includes(item.bloodGroup)
    );

    // Sort to prioritize exact group first, then nearest expiry
    available.sort((a, b) => {
      if (a.bloodGroup === patientBloodGroup && b.bloodGroup !== patientBloodGroup) return -1;
      if (b.bloodGroup === patientBloodGroup && a.bloodGroup !== patientBloodGroup) return 1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });

    return {
      compatibleGroups,
      exactMatchCount: available.filter(u => u.bloodGroup === patientBloodGroup).length,
      totalCompatibleCount: available.length,
      availableUnits: available,
      isSufficient: available.length >= requiredUnits
    };
  }

  // --- REQUEST OPERATIONS ---
  getRequests(filters = {}) {
    return this.state.requests.filter(req => {
      if (filters.urgency && req.urgencyLevel !== filters.urgency) return false;
      if (filters.status && req.status !== filters.status) return false;
      if (filters.bloodGroup && req.bloodGroup !== filters.bloodGroup) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = req.id.toLowerCase().includes(q) ||
                      req.hospitalName.toLowerCase().includes(q) ||
                      req.patientName.toLowerCase().includes(q) ||
                      req.bloodGroup.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }

  createRequest(reqData) {
    const id = `REQ-${new Date().getFullYear()}-${Math.floor(4000 + Math.random() * 5000)}`;
    const newReq = {
      id,
      hospitalId: reqData.hospitalId || 'HOSP-01',
      hospitalName: reqData.hospitalName || 'AIIMS Trauma Centre (JPNATC)',
      patientName: reqData.patientName,
      bloodGroup: reqData.bloodGroup,
      component: reqData.component || 'PRBC',
      unitsRequested: parseInt(reqData.unitsRequested, 10) || 1,
      unitsAllocated: 0,
      urgency: reqData.urgency || 'Urgent (Within 4 hrs)',
      urgencyLevel: reqData.urgencyLevel || 'URGENT',
      status: 'Pending Verification',
      requestDate: new Date().toISOString(),
      reason: reqData.reason || 'Medical Transfusion Protocol',
      doctor: reqData.doctor || 'Attending Physician',
      assignedCenter: reqData.assignedCenter || 'Rotary Central Blood Bank',
      allocatedBagIds: []
    };

    // Auto-allocate if requested or critical
    const compCheck = this.findCompatibleUnits(newReq.bloodGroup, newReq.component, newReq.unitsRequested);
    if (newReq.urgencyLevel === 'CRITICAL' && compCheck.isSufficient) {
      const bagsToReserve = compCheck.availableUnits.slice(0, newReq.unitsRequested);
      bagsToReserve.forEach(bag => {
        this.updateInventoryUnit(bag.id, { status: 'Reserved' });
        newReq.allocatedBagIds.push(bag.id);
      });
      newReq.unitsAllocated = bagsToReserve.length;
      newReq.status = 'Approved';
      newReq.etaMinutes = 25;
      this.addLog('STAT_REQUEST_AUTO_ALLOC', `Auto-allocated ${bagsToReserve.length} units to STAT request ${newReq.id}`);
    } else {
      this.addLog('REQUEST_CREATED', `New blood request ${newReq.id} by ${newReq.hospitalName} for ${newReq.unitsRequested} units ${newReq.bloodGroup} ${newReq.component}`, newReq.doctor);
    }

    this.state.requests.unshift(newReq);
    this.save();
    return newReq;
  }

  updateRequestStatus(id, newStatus, extra = {}) {
    const req = this.state.requests.find(r => r.id === id);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = newStatus;
    if (extra.etaMinutes !== undefined) req.etaMinutes = extra.etaMinutes;

    if (newStatus === 'Approved' && req.allocatedBagIds.length === 0) {
      // Allocate units now
      const match = this.findCompatibleUnits(req.bloodGroup, req.component, req.unitsRequested);
      const toTake = match.availableUnits.slice(0, req.unitsRequested);
      toTake.forEach(bag => {
        this.updateInventoryUnit(bag.id, { status: 'Reserved' });
        req.allocatedBagIds.push(bag.id);
      });
      req.unitsAllocated = toTake.length;
      req.etaMinutes = req.urgencyLevel === 'CRITICAL' ? 20 : 60;
    } else if (newStatus === 'In-Transit') {
      req.allocatedBagIds.forEach(bagId => {
        this.updateInventoryUnit(bagId, { status: 'Dispatched' });
      });
      if (!req.etaMinutes) req.etaMinutes = 15;
    } else if (newStatus === 'Delivered') {
      req.etaMinutes = 0;
    } else if (newStatus === 'Rejected') {
      // Release reserved units
      req.allocatedBagIds.forEach(bagId => {
        this.updateInventoryUnit(bagId, { status: 'Available' });
      });
      req.allocatedBagIds = [];
      req.unitsAllocated = 0;
    }

    this.addLog('REQUEST_STATUS', `Request ${id} status updated from ${oldStatus} -> ${newStatus}`);
    this.save();
    return req;
  }

  // --- DONOR OPERATIONS ---
  getDonors(filters = {}) {
    return this.state.donors.filter(donor => {
      if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
      if (filters.eligible !== undefined && donor.eligible !== filters.eligible) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = donor.name.toLowerCase().includes(q) ||
                      donor.bloodGroup.toLowerCase().includes(q) ||
                      donor.phone.toLowerCase().includes(q) ||
                      donor.email.toLowerCase().includes(q) ||
                      donor.address.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }

  registerDonor(donorData) {
    const id = `DON-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDonor = {
      id,
      name: donorData.name,
      email: donorData.email,
      phone: donorData.phone,
      bloodGroup: donorData.bloodGroup,
      gender: donorData.gender || 'Not Specified',
      dob: donorData.dob || '1995-01-01',
      weightKg: parseFloat(donorData.weightKg) || 65,
      address: donorData.address || 'New Delhi, India',
      totalDonations: parseInt(donorData.totalDonations, 10) || 0,
      lastDonationDate: donorData.lastDonationDate || '',
      eligible: donorData.eligible !== false,
      badge: 'Registered Hero',
      notes: donorData.notes || 'Newly registered donor via portal.',
      medicalCleared: donorData.medicalCleared !== false
    };

    this.state.donors.unshift(newDonor);
    this.addLog('DONOR_REGISTER', `New donor ${newDonor.name} (${newDonor.bloodGroup}) registered`, 'Portal');
    this.save();
    return newDonor;
  }

  recordDonation(donorId, centerId, component = 'PRBC', volumeMl = 350) {
    const donor = this.state.donors.find(d => d.id === donorId);
    if (!donor) return null;

    donor.totalDonations = (donor.totalDonations || 0) + 1;
    donor.lastDonationDate = new Date().toISOString().split('T')[0];
    donor.eligible = false; // requires waiting period

    // Update badge
    if (donor.totalDonations >= 15) donor.badge = 'Platinum Hero';
    else if (donor.totalDonations >= 10) donor.badge = 'Gold Life Saver';
    else if (donor.totalDonations >= 5) donor.badge = 'Silver Donor';
    else donor.badge = 'Bronze Donor';

    // Add blood bag to inventory
    const newBag = this.addInventoryUnit({
      bloodGroup: donor.bloodGroup,
      component,
      volumeMl,
      centerId: centerId || 'CEN-01',
      donorId: donor.id,
      status: 'Available',
      screening: 'Passed',
      addedBy: donor.name
    });

    this.addLog('DONATION_RECORDED', `Recorded donation for ${donor.name}. Inventory unit ${newBag.id} created.`);
    this.save();
    return { donor, newBag };
  }

  // --- CAMPS & APPOINTMENTS ---
  getCamps() {
    return this.state.camps;
  }

  registerForCamp(campId, participant) {
    const camp = this.state.camps.find(c => c.id === campId);
    if (camp) {
      camp.registeredCount = (camp.registeredCount || 0) + 1;
      this.addLog('CAMP_RSVP', `${participant.name || 'Participant'} registered for blood drive: ${camp.title}`);
      this.save();
      return true;
    }
    return false;
  }

  getAppointments() {
    return this.state.appointments;
  }

  bookAppointment(appt) {
    const id = `APT-${Math.floor(500 + Math.random() * 500)}`;
    const newAppt = {
      id,
      donorName: appt.donorName,
      donorPhone: appt.donorPhone,
      bloodGroup: appt.bloodGroup,
      centerName: appt.centerName,
      date: appt.date,
      timeSlot: appt.timeSlot,
      status: 'Confirmed'
    };
    this.state.appointments.unshift(newAppt);
    this.addLog('APPOINTMENT_BOOKED', `Appointment ${id} confirmed for ${appt.donorName} at ${appt.centerName}`);
    this.save();
    return newAppt;
  }

  // --- STATS & ANALYTICS SUMMARY ---
  getStats() {
    const inv = this.state.inventory;
    const available = inv.filter(i => i.status === 'Available');

    // Group counts
    const groupCounts = {};
    window.BBS_DATA.BLOOD_GROUPS.forEach(g => { groupCounts[g] = 0; });
    available.forEach(item => {
      if (groupCounts[item.bloodGroup] !== undefined) {
        groupCounts[item.bloodGroup]++;
      }
    });

    // Component counts
    const componentCounts = {};
    Object.keys(window.BBS_DATA.BLOOD_COMPONENTS).forEach(c => { componentCounts[c] = 0; });
    available.forEach(item => {
      if (componentCounts[item.component] !== undefined) {
        componentCounts[item.component]++;
      }
    });

    // Expiry risks (within 7 days)
    const now = new Date('2026-09-24T00:00:00Z');
    const expiringSoon = available.filter(item => {
      const exp = new Date(item.expiryDate);
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });

    // Critical low blood groups (< 3 units)
    const criticalGroups = Object.entries(groupCounts)
      .filter(([grp, count]) => count < 3)
      .map(([grp, count]) => ({ group: grp, count }));

    // Requests summary
    const pendingReqs = this.state.requests.filter(r => r.status === 'Pending Verification');
    const inTransitReqs = this.state.requests.filter(r => r.status === 'In-Transit');
    const criticalReqs = this.state.requests.filter(r => r.urgencyLevel === 'CRITICAL' && r.status !== 'Delivered');

    // Eligible donors
    const eligibleDonors = this.state.donors.filter(d => d.eligible);

    return {
      totalUnits: available.length,
      totalReserved: inv.filter(i => i.status === 'Reserved').length,
      totalTesting: inv.filter(i => i.status.includes('Quarantine') || i.status.includes('Testing')).length,
      expiringSoonCount: expiringSoon.length,
      expiringUnits: expiringSoon,
      criticalGroups,
      groupCounts,
      componentCounts,
      pendingRequestsCount: pendingReqs.length,
      inTransitRequestsCount: inTransitReqs.length,
      activeCriticalCount: criticalReqs.length,
      totalDonors: this.state.donors.length,
      eligibleDonorsCount: eligibleDonors.length
    };
  }
}

// Global Store Instance
window.bbsStore = new BloodBankStore();
