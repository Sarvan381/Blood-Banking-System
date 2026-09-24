/**
 * Blood Banking System - Native HTML5 Canvas Charts
 * Lightweight, zero-dependency charts for high-resolution displays.
 */

const BBS_Charts = {
  // Setup HiDPI canvas
  setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Check if dimensions are set
    const width = rect.width || canvas.width || 400;
    const height = rect.height || canvas.height || 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  },

  // 1. Group Stock Bar Chart
  renderStockBarChart(canvasId, groupCounts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    const labels = Object.keys(groupCounts);
    const values = Object.values(groupCounts);
    const maxVal = Math.max(10, Math.max(...values) + 2);

    const padding = { top: 25, right: 20, bottom: 35, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-subtle').trim() || '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const yVal = Math.round((maxVal / steps) * i);
      const y = padding.top + chartH - (i / steps) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(yVal.toString(), padding.left - 8, y + 4);
    }

    // Safety threshold line at 3 units
    const critY = padding.top + chartH - (3 / maxVal) * chartH;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, critY);
    ctx.lineTo(width - padding.right, critY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Crit. (3)', width - padding.right, critY - 4);

    // Bars
    const barWidth = Math.min(36, (chartW / labels.length) * 0.65);
    const stepX = chartW / labels.length;

    labels.forEach((label, idx) => {
      const val = values[idx];
      const barH = (val / maxVal) * chartH;
      const x = padding.left + idx * stepX + (stepX - barWidth) / 2;
      const y = padding.top + chartH - barH;

      // Color coding: Red if below 3, vibrant crimson/wine if safe
      const isCritical = val < 3;
      const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
      if (isCritical) {
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(1, '#dc2626');
      } else {
        grad.addColorStop(0, '#e11d48');
        grad.addColorStop(1, '#9f1239');
      }

      ctx.fillStyle = grad;
      // Rounded top bar
      const r = Math.min(4, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, padding.top + chartH);
      ctx.closePath();
      ctx.fill();

      // Top value label
      ctx.fillStyle = isCritical ? '#dc2626' : '#1e293b';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val.toString(), x + barWidth / 2, y - 6);

      // Bottom blood group label
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 16);
    });
  },

  // 2. Component Distribution Donut Chart
  renderComponentDonutChart(canvasId, componentCounts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    const labels = Object.keys(componentCounts);
    const values = Object.values(componentCounts);
    const total = values.reduce((sum, v) => sum + v, 0) || 1;

    const colors = ['#dc2626', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    const centerX = width * 0.35;
    const centerY = height / 2;
    const radius = Math.min(centerX - 15, centerY - 15);
    const innerRadius = radius * 0.6;

    let startAngle = -Math.PI / 2;

    values.forEach((val, idx) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fill();

      startAngle = endAngle;
    });

    // Center text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('UNITS', centerX, centerY + 12);

    // Legend on the right side
    const legendX = width * 0.65;
    let legendY = height / 2 - (labels.length * 20) / 2 + 10;

    labels.forEach((label, idx) => {
      const val = values[idx];
      const pct = Math.round((val / total) * 100);

      // Color badge
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fillRect(legendX, legendY - 9, 10, 10);

      // Label & Pct
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(`${label} (${val})`, legendX + 16, legendY);

      legendY += 22;
    });
  },

  // 3. Activity Trend Line/Area Chart (Monthly Donations vs Emergency Requests)
  renderTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const donations = [42, 58, 65, 52, 74, 88];
    const requests = [35, 48, 51, 49, 68, 71];
    const maxVal = 100;

    const padding = { top: 25, right: 25, bottom: 30, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const yVal = (maxVal / 4) * i;
      const y = padding.top + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(yVal.toString(), padding.left - 6, y + 3);
    }

    const getX = (idx) => padding.left + (idx / (months.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

    // Area Fill for Donations
    ctx.beginPath();
    ctx.moveTo(getX(0), padding.top + chartH);
    donations.forEach((val, idx) => {
      ctx.lineTo(getX(idx), getY(val));
    });
    ctx.lineTo(getX(donations.length - 1), padding.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(225, 29, 72, 0.2)');
    grad.addColorStop(1, 'rgba(225, 29, 72, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line 1: Donations (Red)
    ctx.beginPath();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    donations.forEach((val, idx) => {
      if (idx === 0) ctx.moveTo(getX(idx), getY(val));
      else ctx.lineTo(getX(idx), getY(val));
    });
    ctx.stroke();

    // Line 2: Requests (Blue)
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    requests.forEach((val, idx) => {
      if (idx === 0) ctx.moveTo(getX(idx), getY(val));
      else ctx.lineTo(getX(idx), getY(val));
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Points & Month Labels
    donations.forEach((val, idx) => {
      const x = getX(idx);
      const y = getY(val);
      // Red dot
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Month label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(months[idx], x, height - 10);
    });

    // Request Points
    requests.forEach((val, idx) => {
      const x = getX(idx);
      const y = getY(val);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

window.BBS_Charts = BBS_Charts;
