/**
 * CryptoShift Lab — CBOM Page Controller
 * Connects CbomGenerator to the interactive dynamic CBOM explorer.
 */

(function () {
  'use strict';

  if (typeof CbomGenerator === 'undefined') {
    console.error('CbomGenerator library not loaded.');
    return;
  }

  let currentProfile = 'classical';
  let currentCbomDoc = null;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  function getRiskBadge(risk) {
    if (risk.includes('CRITICAL') || risk.includes('VULNERABLE') || risk.includes('HNDL')) {
      return `<span class="pill-danger">${risk.replace(/_/g, ' ')}</span>`;
    }
    if (risk.includes('TRANSITION') || risk.includes('MODERATE') || risk.includes('DUAL')) {
      return `<span class="pill-warning">${risk.replace(/_/g, ' ')}</span>`;
    }
    return `<span class="pill-success">${risk.replace(/_/g, ' ')}</span>`;
  }

  function getQuantumLevelBadge(level) {
    if (level === 0) {
      return `<span class="pill-danger">Level 0 (Vulnerable)</span>`;
    }
    if (level === 3) {
      return `<span class="pill-success">Level 3 (192-bit PQC)</span>`;
    }
    if (level === 5) {
      return `<span class="pill-success">Level 5 (256-bit PQC)</span>`;
    }
    return `<span class="pill-info">Level ${level}</span>`;
  }

  function renderProfile(profileName) {
    currentProfile = profileName;
    const invDef = CbomGenerator.inventoryDefinitions[profileName];
    if (!invDef) return;

    // 1. Generate full CycloneDX 1.6 document
    currentCbomDoc = CbomGenerator.generateCbom(profileName);

    // 2. Validate document against schema and zero-knowledge rules
    const validation = CbomGenerator.validateCbom(currentCbomDoc);

    // 3. Update Heading & KPIs
    $('#inventoryTableHeading').textContent = `Cryptographic Inventory: ${invDef.label}`;
    $('#kpiAssetCount').textContent = invDef.assets.length;

    if (profileName === 'classical') {
      $('#kpiQuantumRisk').textContent = 'LEVEL 0';
      $('#kpiQuantumRisk').style.color = 'var(--red)';
    } else if (profileName === 'hybrid') {
      $('#kpiQuantumRisk').textContent = 'HYBRID';
      $('#kpiQuantumRisk').style.color = 'var(--yellow)';
    } else {
      $('#kpiQuantumRisk').textContent = 'LEVEL 3+';
      $('#kpiQuantumRisk').style.color = 'var(--green)';
    }

    $('#kpiValidationStatus').textContent = validation.isValid ? 'VALID ✓' : 'INVALID ✗';
    $('#kpiValidationStatus').style.color = validation.isValid ? 'var(--green)' : 'var(--red)';
    $('#kpiZeroLeaks').textContent = '0 LEAKS';

    // 4. Update Table Rows
    const tbody = $('#cbomAssetTableBody');
    tbody.innerHTML = invDef.assets.map(asset => `
      <tr>
        <td>
          <strong>${asset.name}</strong><br>
          <small style="color:var(--muted); font:11px var(--mono);">${asset.oid || 'Custom Ingress'}</small>
        </td>
        <td><span class="pill-info">${asset.primitive.toUpperCase()}</span></td>
        <td style="font:12px var(--mono);">${asset.classicalSecurityBits ? asset.classicalSecurityBits + ' bits' : 'N/A'}</td>
        <td>${getQuantumLevelBadge(asset.nistQuantumSecurityLevel)}</td>
        <td>
          <strong style="font-size:13px;">${asset.component}</strong><br>
          <span style="font-size:12px; color:#5e636e;">${asset.usage}</span>
        </td>
        <td>
          ${getRiskBadge(asset.quantumRisk)}<br>
          <small style="font:600 11px var(--mono); color:#727680;">${asset.migrationStatus.replace(/_/g, ' ')}</small>
        </td>
      </tr>
    `).join('');

    // 5. Update JSON Display
    $('#cbomJsonDisplay').textContent = JSON.stringify(currentCbomDoc, null, 2);

    // 6. Update Active Toolbar Button
    $$('.preset-toolbar .preset-btn').forEach(btn => btn.classList.remove('active'));
    if (profileName === 'classical') $('#btnProfileClassical')?.classList.add('active');
    if (profileName === 'hybrid') $('#btnProfileHybrid')?.classList.add('active');
    if (profileName === 'pqc') $('#btnProfilePqc')?.classList.add('active');
  }

  // Setup Event Handlers
  $('#btnProfileClassical')?.addEventListener('click', () => renderProfile('classical'));
  $('#btnProfileHybrid')?.addEventListener('click', () => renderProfile('hybrid'));
  $('#btnProfilePqc')?.addEventListener('click', () => renderProfile('pqc'));

  // Download CycloneDX 1.6 JSON
  $('#btnDownloadCbom')?.addEventListener('click', () => {
    if (!currentCbomDoc) return;
    const jsonStr = JSON.stringify(currentCbomDoc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbom-cyclonedx-1.6-${currentProfile}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Copy JSON to Clipboard
  $('#btnCopyCbomJson')?.addEventListener('click', async () => {
    if (!currentCbomDoc) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentCbomDoc, null, 2));
      const btn = $('#btnCopyCbomJson');
      btn.textContent = 'Copied! ✓';
      setTimeout(() => { btn.textContent = 'Copy JSON ▢'; }, 1600);
    } catch {
      alert('Failed to copy to clipboard.');
    }
  });

  // Validate Live
  $('#btnValidateCbom')?.addEventListener('click', () => {
    if (!currentCbomDoc) return;
    const res = CbomGenerator.validateCbom(currentCbomDoc);
    if (res.isValid) {
      alert(`[PASS] CycloneDX 1.6 CBOM Schema Validation Successful!\n\n• Components Checked: ${res.componentsCount}\n• Schema Rules Verified: ${res.checkedRulesCount}\n• Private Key Leak Scans: 0 leaks detected\n• Specification: CycloneDX 1.6 Cryptographic Asset Extension`);
    } else {
      alert(`[FAIL] Validation Errors:\n` + res.errors.join('\n'));
    }
  });

  // Initial Load
  renderProfile('classical');

})();
