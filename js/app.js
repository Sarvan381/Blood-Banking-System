/**
 * Blood Banking System - Main Application Controller
 * Handles views, events, interactions, charts rendering, and UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Global References ---
  const store = window.bbsStore;
  const charts = window.BBS_Charts;
  let activeView = 'dashboard';
  let selectedCompatGroup = 'O-';
  let activeRole = 'ADMIN';

  // --- View Switching ---
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const pageTitle = document.getElementById('page-title-heading');

  const viewTitles = {
    dashboard: 'Command Dashboard',
    inventory: 'Live Blood Inventory & Cold Chain Tracking',
    requests: 'Emergency Blood Requests & Dispatch Hub',
    donors: 'Registered LifeSaver Donors Directory',
    compatibility: 'Blood Transfusion Compatibility Calculator',
    camps: 'Mobile Blood Donation Drives & Camps',
    appointments: 'Scheduled Donor Appointments',
    reports: 'Transfusion & Blood Banking Reports',
    audit: 'System Audit Trail & Regulatory Logs'
  };

  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const sidebarEl = document.querySelector('.sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  function closeMobileSidebar() {
    if (sidebarEl) sidebarEl.classList.remove('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  }

  function openMobileSidebar() {
    if (sidebarEl) sidebarEl.classList.add('mobile-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', openMobileSidebar);
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  const bottomNavMore = document.getElementById('bottom-nav-more');
  if (bottomNavMore) {
    bottomNavMore.addEventListener('click', openMobileSidebar);
  }

  function switchView(viewId) {
    activeView = viewId;
    closeMobileSidebar();

    // Desktop sidebar
    navItems.forEach(item => {
      if (item.dataset.view === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Mobile bottom nav
    bottomNavItems.forEach(item => {
      if (item.dataset.bottomView === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    viewPanels.forEach(panel => {
      if (panel.id === `view-${viewId}`) panel.classList.add('active');
      else panel.classList.remove('active');
    });

    if (pageTitle && viewTitles[viewId]) {
      pageTitle.textContent = viewTitles[viewId];
    }

    // Scroll main body to top smoothly on view switch
    const mainContentBody = document.querySelector('.content-body');
    if (mainContentBody) mainContentBody.scrollTop = 0;

    // Refresh charts or view-specific components
    if (viewId === 'dashboard') {
      renderDashboard();
    } else if (viewId === 'inventory') {
      renderInventoryTable();
    } else if (viewId === 'requests') {
      renderRequestsTable();
    } else if (viewId === 'donors') {
      renderDonorsTable();
    } else if (viewId === 'compatibility') {
      renderCompatibilityView();
    } else if (viewId === 'camps') {
      renderCampsView();
    } else if (viewId === 'appointments') {
      renderAppointmentsTable();
    } else if (viewId === 'reports') {
      renderReportsView();
    } else if (viewId === 'audit') {
      renderAuditTable();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.view;
      if (target) switchView(target);
    });
  });

  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.bottomView;
      if (target) switchView(target);
    });
  });

  // Shortcut from Emergency Banner or Quick Button
  const btnQuickEmergency = document.getElementById('btn-quick-emergency');
  if (btnQuickEmergency) {
    btnQuickEmergency.addEventListener('click', () => {
      openModal('modal-create-request');
      updateRequestMatchHint();
    });
  }

  const btnBannerAction = document.getElementById('btn-banner-action');
  if (btnBannerAction) {
    btnBannerAction.addEventListener('click', () => {
      switchView('requests');
    });
  }

  const btnSeeAllReqs = document.getElementById('btn-see-all-requests');
  if (btnSeeAllReqs) {
    btnSeeAllReqs.addEventListener('click', () => {
      switchView('requests');
    });
  }

  // --- Role Switcher ---
  const roleSelect = document.getElementById('user-role-selector');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      activeRole = e.target.value;
      showToast(`Switched active view role to: ${roleSelect.options[roleSelect.selectedIndex].text}`, 'info');
      applyRolePermissions();
    });
  }

  function applyRolePermissions() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = (activeRole === 'ADMIN') ? '' : 'none';
    });
  }

  // --- Theme Changer System (5 Visual Themes) ---
  const themeSelector = document.getElementById('theme-selector');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('BBS_THEME') || 'light';
  
  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('BBS_THEME', themeName);
    if (themeSelector) themeSelector.value = themeName;
    showToast(`Active Theme: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Mode`, 'info');
    // Re-render canvas charts for theme palette adjustments
    if (activeView === 'dashboard') renderDashboard();
    if (activeView === 'reports') renderReportsView();
  }

  // Set initial theme
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeSelector) {
    themeSelector.value = savedTheme;
    themeSelector.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') || 'light';
      const cycle = ['light', 'dark', 'navy', 'emerald', 'saffron'];
      const nextIdx = (cycle.indexOf(active) + 1) % cycle.length;
      applyTheme(cycle[nextIdx]);
    });
  }

  // --- Reset Data ---
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm('Reset all blood banking records, units, and requests back to initial demo dataset?')) {
        store.reset();
        showToast('System data reset to initial benchmark dataset.', 'success');
        refreshAllViews();
      }
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="2"><polygon points="12 2 22 20 2 20 12 2"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- MODAL UTILITIES ---
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });

  // ========================================================
  // VIEW RENDERERS
  // ========================================================

  // 1. DASHBOARD
  function renderDashboard() {
    const stats = store.getStats();

    // Top & bottom badges
    const navInvBadge = document.getElementById('nav-inventory-badge');
    const navReqBadge = document.getElementById('nav-requests-badge');
    const bottomReqBadge = document.getElementById('bottom-requests-badge');
    const totalPendingOrCritical = stats.pendingRequestsCount + stats.activeCriticalCount;

    if (navInvBadge) navInvBadge.textContent = stats.totalUnits;
    if (navReqBadge) navReqBadge.textContent = totalPendingOrCritical;
    if (bottomReqBadge) bottomReqBadge.textContent = totalPendingOrCritical;

    // KPI Cards
    const kpiAvail = document.getElementById('kpi-available-units');
    const kpiReqs = document.getElementById('kpi-emergency-requests');
    const kpiExp = document.getElementById('kpi-expiring-units');
    const kpiDonors = document.getElementById('kpi-total-donors');
    const kpiEligible = document.getElementById('kpi-eligible-donors');
    const kpiCrit = document.getElementById('kpi-critical-count');

    if (kpiAvail) kpiAvail.textContent = stats.totalUnits;
    if (kpiReqs) kpiReqs.textContent = stats.pendingRequestsCount + stats.inTransitRequestsCount;
    if (kpiExp) kpiExp.textContent = stats.expiringSoonCount;
    if (kpiDonors) kpiDonors.textContent = stats.totalDonors;
    if (kpiEligible) kpiEligible.textContent = `${stats.eligibleDonorsCount} Ready`;
    if (kpiCrit) kpiCrit.textContent = `${stats.activeCriticalCount} STAT`;

    // Emergency STAT Banner visibility
    const banner = document.getElementById('dashboard-emergency-banner');
    const bannerTitle = document.getElementById('emergency-banner-title');
    const bannerDesc = document.getElementById('emergency-banner-desc');
    const beacon = document.getElementById('system-status-beacon');
    const beaconText = document.getElementById('system-status-text');

    if (stats.activeCriticalCount > 0) {
      if (banner) banner.style.display = 'flex';
      if (bannerTitle) bannerTitle.textContent = `CRITICAL STAT EMERGENCY: ${stats.activeCriticalCount} ACTIVE PRIORITY 1 DISPATCH(ES)`;
      if (bannerDesc) bannerDesc.textContent = 'Trauma response protocol active. Units reserved and transit timer ticking.';
      if (beacon) {
        beacon.className = 'status-beacon alert';
        if (beaconText) beaconText.textContent = `${stats.activeCriticalCount} Active Code Red`;
      }
    } else {
      if (banner) banner.style.display = 'none';
      if (beacon) {
        beacon.className = 'status-beacon';
        if (beaconText) beaconText.textContent = 'System Operational (Normal)';
      }
    }

    // 8 Blood Groups Shelf
    const shelfContainer = document.getElementById('blood-groups-shelf');
    if (shelfContainer) {
      shelfContainer.innerHTML = '';
      window.BBS_DATA.BLOOD_GROUPS.forEach(grp => {
        const count = stats.groupCounts[grp] || 0;
        let statusClass = 'safe';
        if (count < 3) statusClass = 'critical';
        else if (count <= 5) statusClass = 'low';

        const card = document.createElement('div');
        card.className = `group-unit-card ${statusClass}`;
        card.title = `Click to filter inventory by ${grp}`;
        card.innerHTML = `
          <div class="group-name">${grp}</div>
          <div class="group-count">${count}</div>
          <div class="group-unit-label">Units Available</div>
        `;
        card.addEventListener('click', () => {
          switchView('inventory');
          const groupFilter = document.getElementById('inventory-filter-group');
          if (groupFilter) {
            groupFilter.value = grp;
            renderInventoryTable();
          }
        });
        shelfContainer.appendChild(card);
      });
    }

    // Canvas Charts
    setTimeout(() => {
      charts.renderStockBarChart('canvas-stock-bar', stats.groupCounts);
      charts.renderComponentDonutChart('canvas-component-donut', stats.componentCounts);
    }, 50);

    // Recent Emergency Requests on Dashboard
    const recentReqsTbody = document.getElementById('dashboard-recent-requests-tbody');
    if (recentReqsTbody) {
      recentReqsTbody.innerHTML = '';
      const recent = store.getRequests().slice(0, 5);
      if (recent.length === 0) {
        recentReqsTbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No emergency blood requests currently active.</td></tr>';
      } else {
        recent.forEach(req => {
          const tr = document.createElement('tr');
          const urgencyBadge = req.urgencyLevel === 'CRITICAL' ? 'badge-critical' : (req.urgencyLevel === 'URGENT' ? 'badge-warning' : 'badge-neutral');
          const statusBadge = req.status === 'In-Transit' ? 'badge-warning' : (req.status === 'Approved' ? 'badge-info' : (req.status === 'Delivered' ? 'badge-success' : 'badge-neutral'));

          tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-weight: 700;">${req.id}</td>
            <td><strong>${req.hospitalName}</strong></td>
            <td>${req.patientName}</td>
            <td><span class="badge-blood-type">${req.bloodGroup}</span></td>
            <td>${req.component}</td>
            <td><strong>${req.unitsAllocated} / ${req.unitsRequested}</strong></td>
            <td><span class="badge ${urgencyBadge}">${req.urgencyLevel}</span></td>
            <td><span class="badge ${statusBadge}">${req.status}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="window.viewDispatchDetails('${req.id}')">View</button>
            </td>
          `;
          recentReqsTbody.appendChild(tr);
        });
      }
    }
  }

  // 2. INVENTORY TABLE
  function renderInventoryTable() {
    const searchVal = document.getElementById('inventory-search')?.value || '';
    const groupVal = document.getElementById('inventory-filter-group')?.value || '';
    const compVal = document.getElementById('inventory-filter-comp')?.value || '';
    const statusVal = document.getElementById('inventory-filter-status')?.value || '';

    const tbody = document.getElementById('inventory-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const items = store.getInventory({
      search: searchVal,
      bloodGroup: groupVal,
      component: compVal,
      status: statusVal
    });

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 2rem; color: var(--text-muted);">No blood units found matching current filter parameters.</td></tr>';
      return;
    }

    const now = new Date('2026-09-24T00:00:00Z');

    items.forEach(unit => {
      const expDate = new Date(unit.expiryDate);
      const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

      let statusBadgeClass = 'badge-success';
      let statusText = unit.status;

      if (unit.status === 'Reserved') {
        statusBadgeClass = 'badge-info';
      } else if (unit.status.includes('Quarantine') || unit.status.includes('Testing')) {
        statusBadgeClass = 'badge-warning';
      } else if (unit.status === 'Dispatched') {
        statusBadgeClass = 'badge-neutral';
      } else if (diffDays <= 7 && diffDays >= 0) {
        statusBadgeClass = 'badge-critical';
        statusText = `Expiring (${diffDays}d)`;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700;">${unit.id}</td>
        <td><span class="badge-blood-type">${unit.bloodGroup}</span></td>
        <td><strong>${unit.component}</strong></td>
        <td>${unit.volumeMl} ml</td>
        <td>${unit.collectedDate}</td>
        <td>
          <span style="${diffDays <= 7 ? 'color: var(--danger); font-weight: 700;' : ''}">${unit.expiryDate}</span>
        </td>
        <td><span style="font-size: 0.8rem; color: var(--text-muted);">${unit.location}</span></td>
        <td><span class="badge badge-success">${unit.screening}</span></td>
        <td><span class="badge ${statusBadgeClass}">${statusText}</span></td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" title="Mark In-Inspection / Available" onclick="window.toggleUnitStatus('${unit.id}')">Toggle</button>
            <button class="btn btn-secondary btn-sm" style="color: var(--danger);" title="Discard / Discarded Bag" onclick="window.discardUnit('${unit.id}')">&times;</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Inventory Filters Event Listeners
  ['inventory-search', 'inventory-filter-group', 'inventory-filter-comp', 'inventory-filter-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderInventoryTable);
  });

  // Add Blood Unit Modal & Form
  const btnAddUnitModal = document.getElementById('btn-add-unit-modal-open');
  if (btnAddUnitModal) {
    btnAddUnitModal.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      const dateEl = document.getElementById('add-unit-date');
      if (dateEl) dateEl.value = today;
      openModal('modal-add-unit');
    });
  }

  const formAddUnit = document.getElementById('form-add-unit');
  if (formAddUnit) {
    formAddUnit.addEventListener('submit', (e) => {
      e.preventDefault();
      const group = document.getElementById('add-unit-group').value;
      const comp = document.getElementById('add-unit-comp').value;
      const volume = document.getElementById('add-unit-volume').value;
      const center = document.getElementById('add-unit-center').value;
      const colDate = document.getElementById('add-unit-date').value;
      const loc = document.getElementById('add-unit-location').value;
      const screening = document.getElementById('add-unit-screening').value;

      const newUnit = store.addInventoryUnit({
        bloodGroup: group,
        component: comp,
        volumeMl: volume,
        centerId: center,
        collectedDate: colDate,
        location: loc,
        screening: screening,
        status: screening.includes('Pending') ? 'Testing / Quarantine' : 'Available'
      });

      closeModal('modal-add-unit');
      showToast(`Blood Unit ${newUnit.id} (${group} ${comp}) successfully registered in inventory.`, 'success');
      renderInventoryTable();
      renderDashboard();
    });
  }

  // Export Inventory as CSV
  const btnExportCsv = document.getElementById('btn-export-inventory-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const inv = store.getInventory();
      let csv = 'Bag ID,Blood Group,Component,Volume (ml),Collection Date,Expiry Date,Location,Screening,Status\n';
      inv.forEach(u => {
        csv += `"${u.id}","${u.bloodGroup}","${u.component}","${u.volumeMl}","${u.collectedDate}","${u.expiryDate}","${u.location}","${u.screening}","${u.status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `PulseLink_Blood_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Inventory report downloaded as CSV.', 'success');
    });
  }

  // Global actions for inventory row buttons
  window.toggleUnitStatus = function(id) {
    const unit = store.state.inventory.find(i => i.id === id);
    if (!unit) return;
    const nextStatus = unit.status === 'Available' ? 'Testing / Quarantine' : 'Available';
    store.updateInventoryUnit(id, { status: nextStatus });
    showToast(`Unit ${id} status updated to ${nextStatus}`, 'info');
    renderInventoryTable();
    renderDashboard();
  };

  window.discardUnit = function(id) {
    if (confirm(`Confirm discarding damaged or expired blood unit ${id}?`)) {
      store.deleteInventoryUnit(id);
      showToast(`Unit ${id} removed and recorded in disposal log.`, 'warning');
      renderInventoryTable();
      renderDashboard();
    }
  };

  // 3. EMERGENCY REQUESTS & DISPATCH
  function renderRequestsTable() {
    const searchVal = document.getElementById('requests-search')?.value || '';
    const urgencyVal = document.getElementById('requests-filter-urgency')?.value || '';
    const statusVal = document.getElementById('requests-filter-status')?.value || '';

    const tbody = document.getElementById('requests-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const reqs = store.getRequests({
      search: searchVal,
      urgency: urgencyVal,
      status: statusVal
    });

    if (reqs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2rem; color: var(--text-muted);">No emergency blood requests found.</td></tr>';
      return;
    }

    reqs.forEach(req => {
      const urgencyBadge = req.urgencyLevel === 'CRITICAL' ? 'badge-critical' : (req.urgencyLevel === 'URGENT' ? 'badge-warning' : 'badge-neutral');
      const statusBadge = req.status === 'In-Transit' ? 'badge-warning' : (req.status === 'Approved' ? 'badge-info' : (req.status === 'Delivered' ? 'badge-success' : (req.status === 'Rejected' ? 'badge-critical' : 'badge-neutral')));

      // Action buttons depending on state
      let actionsHtml = `<button class="btn btn-secondary btn-sm" onclick="window.viewDispatchDetails('${req.id}')">Track</button>`;

      if (req.status === 'Pending Verification') {
        actionsHtml += `
          <button class="btn btn-primary btn-sm" onclick="window.approveRequest('${req.id}')">Approve & Allocate</button>
          <button class="btn btn-secondary btn-sm" style="color: var(--danger);" onclick="window.rejectRequest('${req.id}')">Reject</button>
        `;
      } else if (req.status === 'Approved') {
        actionsHtml += `
          <button class="btn btn-danger-emergency btn-sm" onclick="window.dispatchRequest('${req.id}')">Dispatch Cold Chain</button>
        `;
      } else if (req.status === 'In-Transit') {
        actionsHtml += `
          <button class="btn btn-primary btn-sm" onclick="window.deliverRequest('${req.id}')">Mark Delivered</button>
        `;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700;">${req.id}</td>
        <td>
          <strong>${req.hospitalName}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${req.doctor}</div>
        </td>
        <td>
          <div>${req.patientName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${req.reason}</div>
        </td>
        <td>
          <span class="badge-blood-type">${req.bloodGroup}</span>
          <span style="font-size: 0.8rem; margin-left: 0.3rem;">${req.component}</span>
        </td>
        <td>
          <strong>${req.unitsAllocated} / ${req.unitsRequested}</strong> Units
        </td>
        <td><span class="badge ${urgencyBadge}">${req.urgency}</span></td>
        <td><span class="badge ${statusBadge}">${req.status}</span></td>
        <td>
          ${req.etaMinutes !== undefined && req.status === 'In-Transit'
            ? `<span style="color: var(--danger); font-weight: 700;">ETA ${req.etaMinutes} mins</span>`
            : (req.status === 'Delivered' ? '<span style="color: var(--success);">Delivered</span>' : '&mdash;')}
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${actionsHtml}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Request Filters Event Listeners
  ['requests-search', 'requests-filter-urgency', 'requests-filter-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderRequestsTable);
  });

  // Emergency Request Modal & Live Compatibility Helper
  const btnCreateReqModal = document.getElementById('btn-create-request-modal');
  if (btnCreateReqModal) {
    btnCreateReqModal.addEventListener('click', () => {
      openModal('modal-create-request');
      updateRequestMatchHint();
    });
  }

  function updateRequestMatchHint() {
    const group = document.getElementById('req-blood-group')?.value || 'O-';
    const comp = document.getElementById('req-component')?.value || 'PRBC';
    const units = parseInt(document.getElementById('req-units')?.value || '1', 10);
    const hintBox = document.getElementById('req-match-text');

    if (!hintBox) return;

    const match = store.findCompatibleUnits(group, comp, units);
    if (match.isSufficient) {
      hintBox.innerHTML = `
        <span style="color: var(--success); font-weight: 700;">&#10003; Compatible Stock Available:</span>
        ${match.exactMatchCount} exact ${group} units + ${match.totalCompatibleCount - match.exactMatchCount} compatible alternative units in cold storage.
      `;
    } else {
      hintBox.innerHTML = `
        <span style="color: var(--danger); font-weight: 700;">&#9888; Warning: Insufficient Available Stock.</span>
        Only ${match.totalCompatibleCount} unit(s) found (Exact match + compatible). Donor emergency callout may be required!
      `;
    }
  }

  ['req-blood-group', 'req-component', 'req-units'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateRequestMatchHint);
  });

  const formCreateReq = document.getElementById('form-create-request');
  if (formCreateReq) {
    formCreateReq.addEventListener('submit', (e) => {
      e.preventDefault();
      const hospitalName = document.getElementById('req-hospital').value;
      const patient = document.getElementById('req-patient').value;
      const group = document.getElementById('req-blood-group').value;
      const comp = document.getElementById('req-component').value;
      const units = document.getElementById('req-units').value;
      const urgencyLevel = document.getElementById('req-urgency').value;
      const reason = document.getElementById('req-reason').value;
      const doctor = document.getElementById('req-doctor').value;

      const urgencyText = urgencyLevel === 'CRITICAL' ? 'STAT / Critical (Under 1 hr)' : (urgencyLevel === 'URGENT' ? 'Urgent (Within 4 hrs)' : 'Routine (Within 24 hrs)');

      const newReq = store.createRequest({
        hospitalName,
        patientName: patient,
        bloodGroup: group,
        component: comp,
        unitsRequested: units,
        urgencyLevel,
        urgency: urgencyText,
        reason,
        doctor
      });

      closeModal('modal-create-request');
      showToast(`Emergency Request ${newReq.id} created successfully! ${urgencyLevel === 'CRITICAL' ? 'Priority dispatch initiated.' : ''}`, urgencyLevel === 'CRITICAL' ? 'danger' : 'success');
      renderRequestsTable();
      renderDashboard();
    });
  }

  // Request Action Helpers
  window.approveRequest = function(id) {
    const req = store.updateRequestStatus(id, 'Approved');
    showToast(`Request ${id} Approved. ${req.unitsAllocated} units reserved in storage.`, 'success');
    renderRequestsTable();
    renderDashboard();
  };

  window.dispatchRequest = function(id) {
    store.updateRequestStatus(id, 'In-Transit', { etaMinutes: 20 });
    showToast(`Cold-chain ambulance dispatched for request ${id}! Live tracking active.`, 'warning');
    renderRequestsTable();
    renderDashboard();
  };

  window.deliverRequest = function(id) {
    store.updateRequestStatus(id, 'Delivered');
    showToast(`Request ${id} marked Delivered. Transfusion handover completed.`, 'success');
    renderRequestsTable();
    renderDashboard();
  };

  window.rejectRequest = function(id) {
    if (confirm(`Reject blood request ${id}? Reserved units will be released back to inventory.`)) {
      store.updateRequestStatus(id, 'Rejected');
      showToast(`Request ${id} rejected. Inventory released.`, 'info');
      renderRequestsTable();
      renderDashboard();
    }
  };

  // Dispatch Tracking Modal
  window.viewDispatchDetails = function(id) {
    const req = store.state.requests.find(r => r.id === id);
    if (!req) return;

    const modalTitle = document.getElementById('dispatch-modal-title');
    const content = document.getElementById('dispatch-modal-content');
    if (modalTitle) modalTitle.textContent = `Dispatch Tracker: ${req.id}`;

    let stepIndex = 1;
    if (req.status === 'Approved') stepIndex = 2;
    else if (req.status === 'In-Transit') stepIndex = 3;
    else if (req.status === 'Delivered') stepIndex = 4;

    content.innerHTML = `
      <div class="tracker-timeline">
        <div class="tracker-step ${stepIndex >= 1 ? (stepIndex === 1 ? 'active' : 'completed') : ''}">
          <div class="tracker-icon-circle">1</div>
          <div class="tracker-label">Requested</div>
        </div>
        <div class="tracker-step ${stepIndex >= 2 ? (stepIndex === 2 ? 'active' : 'completed') : ''}">
          <div class="tracker-icon-circle">2</div>
          <div class="tracker-label">Reserved & Checked</div>
        </div>
        <div class="tracker-step ${stepIndex >= 3 ? (stepIndex === 3 ? 'active' : 'completed') : ''}">
          <div class="tracker-icon-circle">3</div>
          <div class="tracker-label">Cold-Chain Transit</div>
        </div>
        <div class="tracker-step ${stepIndex >= 4 ? 'completed' : ''}">
          <div class="tracker-icon-circle">4</div>
          <div class="tracker-label">Delivered / Infused</div>
        </div>
      </div>

      <div style="background: var(--bg-main); border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem; font-size: 0.875rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
          <div><strong>Destination:</strong> ${req.hospitalName}</div>
          <div><strong>Patient:</strong> ${req.patientName}</div>
          <div><strong>Blood Specification:</strong> ${req.bloodGroup} ${req.component} (${req.unitsRequested} units)</div>
          <div><strong>Assigned Hub:</strong> ${req.assignedCenter}</div>
        </div>
        <div><strong>Allocated Blood Unit Bags:</strong> ${req.allocatedBagIds.length > 0 ? req.allocatedBagIds.map(b => `<span class="badge badge-neutral">${b}</span>`).join(' ') : 'None allocated yet'}</div>
        ${req.etaMinutes ? `<div style="margin-top: 0.75rem; font-size: 1rem; color: var(--danger); font-weight: 700;">&#128657; Estimated Ambulance Arrival: ${req.etaMinutes} Minutes</div>` : ''}
      </div>
    `;

    openModal('modal-dispatch-details');
  };

  // 4. DONORS REGISTRY
  function renderDonorsTable() {
    const searchVal = document.getElementById('donors-search')?.value || '';
    const groupVal = document.getElementById('donors-filter-group')?.value || '';
    const eligibleVal = document.getElementById('donors-filter-eligible')?.value || '';

    const tbody = document.getElementById('donors-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const donors = store.getDonors({
      search: searchVal,
      bloodGroup: groupVal,
      eligible: eligibleVal ? eligibleVal === 'true' : undefined
    });

    if (donors.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 2rem; color: var(--text-muted);">No donors found matching criteria.</td></tr>';
      return;
    }

    donors.forEach(donor => {
      const tr = document.createElement('tr');
      const badgeStyle = donor.badge.includes('Platinum') ? 'badge-critical' : (donor.badge.includes('Gold') ? 'badge-warning' : 'badge-info');

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700;">${donor.id}</td>
        <td>
          <strong>${donor.name}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${donor.address}</div>
        </td>
        <td><span class="badge-blood-type">${donor.bloodGroup}</span></td>
        <td>${donor.gender} (${donor.weightKg} kg)</td>
        <td>
          <div>${donor.phone}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${donor.email}</div>
        </td>
        <td><strong>${donor.totalDonations}</strong> donations</td>
        <td>${donor.lastDonationDate || 'First Time'}</td>
        <td>
          ${donor.eligible
            ? '<span class="badge badge-success">&#10003; Eligible</span>'
            : '<span class="badge badge-warning">Waiting Period</span>'}
        </td>
        <td><span class="badge ${badgeStyle}">${donor.badge}</span></td>
        <td>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.viewDonorCard('${donor.id}')">ID Pass</button>
            <button class="btn btn-primary btn-sm" onclick="window.recordDonationAction('${donor.id}')">+ Donate</button>
            <button class="btn btn-secondary btn-sm" title="Simulate Callout" onclick="window.calloutDonor('${donor.id}')">&#128222;</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  ['donors-search', 'donors-filter-group', 'donors-filter-eligible'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderDonorsTable);
  });

  // Register Donor Modal & Form
  const btnRegDonor = document.getElementById('btn-register-donor-modal-open');
  if (btnRegDonor) {
    btnRegDonor.addEventListener('click', () => openModal('modal-register-donor'));
  }

  const formRegisterDonor = document.getElementById('form-register-donor');
  if (formRegisterDonor) {
    formRegisterDonor.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('donor-name').value;
      const group = document.getElementById('donor-group').value;
      const email = document.getElementById('donor-email').value;
      const phone = document.getElementById('donor-phone').value;
      const gender = document.getElementById('donor-gender').value;
      const weight = document.getElementById('donor-weight').value;
      const address = document.getElementById('donor-address').value;

      const newDonor = store.registerDonor({
        name,
        bloodGroup: group,
        email,
        phone,
        gender,
        weightKg: weight,
        address,
        eligible: true
      });

      closeModal('modal-register-donor');
      showToast(`Welcome ${name}! Registered as a LifeSaver Donor (${group}).`, 'success');
      renderDonorsTable();
      renderDashboard();
    });
  }

  // Donor Card Modal
  window.viewDonorCard = function(donorId) {
    const donor = store.state.donors.find(d => d.id === donorId);
    if (!donor) return;

    document.getElementById('card-blood-group').textContent = donor.bloodGroup;
    document.getElementById('card-donor-name').textContent = donor.name;
    document.getElementById('card-donor-id').textContent = `ID: ${donor.id}`;
    document.getElementById('card-donor-donations').textContent = donor.totalDonations;
    document.getElementById('card-donor-lives').textContent = donor.totalDonations * 3;
    document.getElementById('card-donor-badge').textContent = donor.badge;
    document.getElementById('card-barcode-text').textContent = `${donor.id}-PULSELINK-IN`;

    openModal('modal-donor-card');
  };

  const btnPrintCard = document.getElementById('btn-print-donor-card');
  if (btnPrintCard) {
    btnPrintCard.addEventListener('click', () => window.print());
  }

  // Record Donation Quick Action
  window.recordDonationAction = function(donorId) {
    const donor = store.state.donors.find(d => d.id === donorId);
    if (!donor) return;

    if (!donor.eligible) {
      if (!confirm(`${donor.name} is currently within the waiting period interval since last donation. Override clearance and proceed?`)) {
        return;
      }
    }

    const res = store.recordDonation(donorId, 'CEN-01', 'PRBC', 350);
    showToast(`Recorded new blood donation for ${donor.name}! Blood Bag ${res.newBag.id} added to inventory.`, 'success');
    renderDonorsTable();
    renderInventoryTable();
    renderDashboard();
  };

  // Donor Callout Simulation
  window.calloutDonor = function(donorId) {
    const donor = store.state.donors.find(d => d.id === donorId);
    if (!donor) return;
    showToast(`Emergency SMS sent to ${donor.name} (${donor.phone}): "Urgent call for ${donor.bloodGroup} blood at Rotary Central Blood Bank (New Delhi)"`, 'warning');
    store.addLog('DONOR_CALLOUT', `Simulated urgent broadcast sent to ${donor.name} (${donor.bloodGroup})`);
  };

  // Eligibility Quiz
  const btnQuiz = document.getElementById('btn-eligibility-quiz-open');
  if (btnQuiz) {
    btnQuiz.addEventListener('click', () => {
      document.getElementById('quiz-result-box').style.display = 'none';
      openModal('modal-eligibility-quiz');
    });
  }

  const btnSubmitQuiz = document.getElementById('btn-submit-quiz');
  if (btnSubmitQuiz) {
    btnSubmitQuiz.addEventListener('click', () => {
      const q1 = document.getElementById('quiz-q1').value;
      const q2 = document.getElementById('quiz-q2').value;
      const q3 = document.getElementById('quiz-q3').value;
      const q4 = document.getElementById('quiz-q4').value;
      const resBox = document.getElementById('quiz-result-box');

      resBox.style.display = 'block';
      if (q1 === 'yes' && q2 === 'yes' && q3 === 'yes' && q4 === 'yes') {
        resBox.style.background = '#d1fae5';
        resBox.style.color = '#065f46';
        resBox.style.border = '1px solid #a7f3d0';
        resBox.innerHTML = '&#10004; Excellent! You satisfy all standard basic screening criteria to donate blood today. Book an appointment now!';
      } else {
        resBox.style.background = '#fee2e2';
        resBox.style.color = '#991b1b';
        resBox.style.border = '1px solid #fecaca';
        resBox.innerHTML = '&#9888; You may be temporarily deferred from donating today based on the criteria above. Please consult our on-duty hematologist for details.';
      }
    });
  }

  // 5. COMPATIBILITY CALCULATOR
  function renderCompatibilityView() {
    const btnContainer = document.getElementById('compat-selector-buttons');
    if (!btnContainer) return;
    btnContainer.innerHTML = '';

    window.BBS_DATA.BLOOD_GROUPS.forEach(grp => {
      const btn = document.createElement('button');
      btn.className = `compat-btn ${grp === selectedCompatGroup ? 'active' : ''}`;
      btn.textContent = grp;
      btn.addEventListener('click', () => {
        selectedCompatGroup = grp;
        renderCompatibilityView();
      });
      btnContainer.appendChild(btn);
    });

    const display = document.getElementById('compat-details-display');
    if (!display) return;

    const rbc = window.BBS_DATA.RBC_COMPATIBILITY[selectedCompatGroup] || { canGiveTo: [], canReceiveFrom: [] };
    const plasma = window.BBS_DATA.PLASMA_COMPATIBILITY[selectedCompatGroup] || { canGiveTo: [], canReceiveFrom: [] };

    display.innerHTML = `
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          Red Blood Cells (RBC) for Group ${selectedCompatGroup}
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          Population Frequency: <strong>${rbc.rarity || 'Common'}</strong>
        </p>

        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 700;">Can DONATE Red Cells To:</div>
          <div class="compat-group-list">
            ${rbc.canGiveTo.map(g => `<span class="compat-pill give">&#10003; ${g}</span>`).join('')}
          </div>
        </div>

        <div>
          <div style="font-size: 0.85rem; font-weight: 700;">Can RECEIVE Red Cells From:</div>
          <div class="compat-group-list">
            ${rbc.canReceiveFrom.map(g => `<span class="compat-pill receive">&#8595; ${g}</span>`).join('')}
          </div>
        </div>
      </div>

      <div>
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--accent-blue); display: flex; align-items: center; gap: 0.5rem;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10h-10z"/></svg>
          Plasma & Platelets for Group ${selectedCompatGroup}
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          Plasma rules are the reverse of red cells due to circulating antibodies.
        </p>

        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 700;">Can DONATE Plasma To:</div>
          <div class="compat-group-list">
            ${plasma.canGiveTo.map(g => `<span class="compat-pill give">&#10003; ${g}</span>`).join('')}
          </div>
        </div>

        <div>
          <div style="font-size: 0.85rem; font-weight: 700;">Can RECEIVE Plasma From:</div>
          <div class="compat-group-list">
            ${plasma.canReceiveFrom.map(g => `<span class="compat-pill receive">&#8595; ${g}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 6. CAMPS & DRIVES
  function renderCampsView() {
    const container = document.getElementById('camps-list-container');
    if (!container) return;
    container.innerHTML = '';

    const camps = store.getCamps();
    camps.forEach(camp => {
      const pct = Math.min(100, Math.round((camp.registeredCount / camp.targetUnits) * 100));
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${camp.title}</div>
          <span class="badge badge-success">${camp.status}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">
          <div><strong>Organizer:</strong> ${camp.organizer}</div>
          <div><strong>Date & Time:</strong> ${camp.date} (${camp.time})</div>
          <div><strong>Venue:</strong> ${camp.venue}</div>
          <div><strong>Helpline:</strong> ${camp.contactPhone}</div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.25rem;">
            <span>Target Goal: ${camp.registeredCount} / ${camp.targetUnits} Units</span>
            <span style="font-weight: 700;">${pct}%</span>
          </div>
          <div style="width: 100%; height: 8px; background: var(--bg-main); border-radius: 4px; overflow: hidden; border: 1px solid var(--border);">
            <div style="width: ${pct}%; height: 100%; background: var(--primary);"></div>
          </div>
        </div>

        <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="window.registerCampRSVP('${camp.id}')">
          RSVP / Register to Donate
        </button>
      `;
      container.appendChild(card);
    });
  }

  window.registerCampRSVP = function(campId) {
    const name = prompt('Enter your name to register for this blood drive:');
    if (name) {
      store.registerForCamp(campId, { name });
      showToast(`Thank you ${name}! You are registered for the blood drive.`, 'success');
      renderCampsView();
    }
  };

  // 7. APPOINTMENTS
  function renderAppointmentsTable() {
    const tbody = document.getElementById('appointments-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const appts = store.getAppointments();
    if (appts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">No scheduled appointments found.</td></tr>';
      return;
    }

    appts.forEach(apt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700;">${apt.id}</td>
        <td><strong>${apt.donorName}</strong></td>
        <td>${apt.donorPhone}</td>
        <td><span class="badge-blood-type">${apt.bloodGroup}</span></td>
        <td>${apt.centerName}</td>
        <td>${apt.date} at ${apt.timeSlot}</td>
        <td><span class="badge badge-success">${apt.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Reminder SMS triggered for ${apt.donorName}', 'info')">Send Reminder</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const btnBookApptModal = document.getElementById('btn-book-appointment-modal-open');
  if (btnBookApptModal) {
    btnBookApptModal.addEventListener('click', () => {
      const dateEl = document.getElementById('appt-date');
      if (dateEl) dateEl.value = '2026-09-27';
      openModal('modal-book-appointment');
    });
  }

  const formBookAppt = document.getElementById('form-book-appointment');
  if (formBookAppt) {
    formBookAppt.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('appt-name').value;
      const phone = document.getElementById('appt-phone').value;
      const group = document.getElementById('appt-group').value;
      const center = document.getElementById('appt-center').value;
      const date = document.getElementById('appt-date').value;
      const slot = document.getElementById('appt-slot').value;

      const apt = store.bookAppointment({
        donorName: name,
        donorPhone: phone,
        bloodGroup: group,
        centerName: center,
        date,
        timeSlot: slot
      });

      closeModal('modal-book-appointment');
      showToast(`Appointment ${apt.id} confirmed for ${name} on ${date}!`, 'success');
      renderAppointmentsTable();
    });
  }

  // 8. REPORTS & ANALYTICS
  function renderReportsView() {
    const stats = store.getStats();
    const summaryText = document.getElementById('report-summary-text');

    if (summaryText) {
      summaryText.innerHTML = `
        <p><strong>PulseLink National Blood Transfusion Network (NBTC India) - Utilization Audit</strong></p>
        <p>As of <strong>${new Date().toLocaleDateString('en-IN')}</strong>, the blood banking network holds a total of <strong>${stats.totalUnits} active screened units</strong> across all affiliated regional centers (Delhi, Bengaluru, Mumbai).</p>
        <ul style="margin: 0.75rem 0 0.75rem 1.5rem; line-height: 1.8;">
          <li><strong>Universal O- Reserve Status:</strong> ${stats.groupCounts['O-'] || 0} units available. ${stats.groupCounts['O-'] < 3 ? '<span style="color: var(--danger); font-weight: 700;">(CRITICAL DEFICIT - National emergency callout required)</span>' : '(Adequate)'}</li>
          <li><strong>Units Nearing Expiry (&le; 7 days):</strong> <strong>${stats.expiringSoonCount} units</strong> slated for accelerated cross-matching or component reprocessing to eliminate biological waste.</li>
          <li><strong>Active Hospital Requests:</strong> <strong>${stats.pendingRequestsCount + stats.inTransitRequestsCount} orders</strong>, with <strong>${stats.activeCriticalCount}</strong> designated as STAT / Code Red trauma requests.</li>
          <li><strong>Donor Community Pool:</strong> <strong>${stats.totalDonors} registered donors</strong> with <strong>${stats.eligibleDonorsCount} ready for immediate callout</strong>.</li>
        </ul>
        <p>All blood components are tracked under continuous temperature and cold-chain monitoring protocols in accordance with National Blood Transfusion Council (NBTC), DCGI, and WHO biological safety directives.</p>
      `;
    }

    setTimeout(() => {
      charts.renderTrendChart('canvas-report-trend');
    }, 50);
  }

  // 9. AUDIT TRAIL
  function renderAuditTable() {
    const tbody = document.getElementById('audit-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const logs = store.state.auditLogs;
    logs.forEach(log => {
      const tr = document.createElement('tr');
      let actionClass = 'badge-neutral';
      if (log.action.includes('STAT') || log.action.includes('DISPATCH')) actionClass = 'badge-critical';
      else if (log.action.includes('APPROVE') || log.action.includes('REGISTER')) actionClass = 'badge-success';
      else if (log.action.includes('ALERT') || log.action.includes('DISCARD')) actionClass = 'badge-warning';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${log.timestamp}</td>
        <td><strong>${log.user}</strong></td>
        <td><span class="badge ${actionClass}">${log.action}</span></td>
        <td>${log.details}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Helper to refresh all views when state changes
  function refreshAllViews() {
    renderDashboard();
    renderInventoryTable();
    renderRequestsTable();
    renderDonorsTable();
    renderCompatibilityView();
    renderCampsView();
    renderAppointmentsTable();
    renderReportsView();
    renderAuditTable();
  }

  // Subscribe store changes to refresh active view automatically
  store.subscribe('change', () => {
    if (activeView === 'dashboard') renderDashboard();
    else if (activeView === 'inventory') renderInventoryTable();
    else if (activeView === 'requests') renderRequestsTable();
    else if (activeView === 'donors') renderDonorsTable();
  });

  // Handle window resizing for responsive Canvas charts
  window.addEventListener('resize', () => {
    if (activeView === 'dashboard') renderDashboard();
    if (activeView === 'reports') renderReportsView();
  });

  // ========================================================
  // MOBILE GESTURE & SWIPE CONTROLS
  // Prevents accidental browser history navigation and enables in-app swiping
  // ========================================================
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartX);
    const diffY = Math.abs(currentY - touchStartY);

    // If gesture starts within 25px of left/right screen edge and is predominantly horizontal,
    // prevent default browser gesture (swipe to go back/forward)
    if ((touchStartX < 25 || touchStartX > window.innerWidth - 25) && diffX > diffY) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    
    // Don't switch tabs if a modal or the sidebar drawer is open
    if (document.querySelector('.modal-overlay.active')) return;
    if (sidebarEl && sidebarEl.classList.contains('mobile-open')) return;

    // Ignore touches on interactive components (tables, canvas, forms, buttons)
    const target = e.target;
    if (
      target.closest('.table-responsive') ||
      target.closest('canvas') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('.btn') ||
      target.closest('.compat-matrix-grid')
    ) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const duration = Date.now() - touchStartTime;

    // Detect quick horizontal swipe: min 55px horizontal displacement, under 45px vertical, within 450ms
    if (Math.abs(diffX) > 55 && Math.abs(diffY) < 45 && duration < 450) {
      const mainTabs = ['dashboard', 'inventory', 'requests', 'donors'];
      const currentIdx = mainTabs.indexOf(activeView);
      if (currentIdx !== -1) {
        if (diffX < 0 && currentIdx < mainTabs.length - 1) {
          // Swiped left -> advance to next tab
          switchView(mainTabs[currentIdx + 1]);
        } else if (diffX > 0 && currentIdx > 0) {
          // Swiped right -> go to previous tab
          switchView(mainTabs[currentIdx - 1]);
        }
      }
    }
  }, { passive: true });

  // Initial render
  refreshAllViews();
});
