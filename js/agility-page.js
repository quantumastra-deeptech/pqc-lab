/**
 * CryptoShift Lab — Crypto-Agility Page Controller
 * Demonstrates the CryptoProvider architectural seam with live ISO 20022 payment execution.
 */

(function () {
  'use strict';

  if (typeof CryptoProviders === 'undefined') {
    console.error('CryptoProviders library not loaded.');
    return;
  }

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  let currentProfile = 'classical';
  const controller = new CryptoProviders.PaymentController(CryptoProviders.getProvider('classical'));

  const samplePaymentPayload = {
    messageType: 'pacs.008.001.08 (ISO 20022 FI-to-FI Customer Credit Transfer)',
    transactionId: 'TX-2026-QUANTUM-99182',
    instructedAmount: {
      currency: 'USD',
      amount: '1,250,000.00'
    },
    debtor: {
      name: 'Global Investment Fund Holdings Ltd',
      accountIban: 'US89BANK00001234567890'
    },
    creditor: {
      name: 'Pacific Reserve Clearing Corp',
      accountIban: 'US44CHAS00009876543210'
    },
    valueDate: '2026-11-14',
    settlementMethod: 'CLRG'
  };

  const sensitiveIban = 'US89BANK00001234567890 (Debtor Confidential Account)';

  const profileSpecs = {
    classical: {
      title: 'ClassicalProvider',
      subtitle: 'RSA-PSS-2048 / RSA-OAEP',
      sigAlgo: 'RSA-PSS-2048',
      sigSize: '256 B',
      quantumSec: '0 BITS (BROKEN)',
      quantumColor: 'var(--red)'
    },
    hybrid: {
      title: 'HybridProvider',
      subtitle: 'Dual RSA + ML-DSA-65 / Hybrid KEM',
      sigAlgo: 'Dual (RSA + ML-DSA)',
      sigSize: '3,565 B',
      quantumSec: '192 BITS',
      quantumColor: 'var(--yellow)'
    },
    pqc: {
      title: 'PQCProvider',
      subtitle: 'NIST FIPS 204 ML-DSA-65 / FIPS 203 ML-KEM-768',
      sigAlgo: 'ML-DSA-65',
      sigSize: '3,309 B',
      quantumSec: '192 BITS (CAT 3)',
      quantumColor: 'var(--green)'
    }
  };

  function setProfile(profileName) {
    currentProfile = profileName;
    const provider = CryptoProviders.getProvider(profileName);
    controller.setProvider(provider);

    const spec = profileSpecs[profileName];
    $('#activeProviderNodeTitle').textContent = spec.title;
    $('#activeProviderNodeSub').textContent = spec.subtitle;

    $('#kpiAgilitySigAlgo').textContent = spec.sigAlgo;
    $('#kpiAgilitySigSize').textContent = spec.sigSize;
    $('#kpiAgilityQuantumSec').textContent = spec.quantumSec;
    $('#kpiAgilityQuantumSec').style.color = spec.quantumColor;

    $$('.preset-toolbar .preset-btn').forEach(btn => btn.classList.remove('active'));
    if (profileName === 'classical') $('#btnAgilityClassical')?.classList.add('active');
    if (profileName === 'hybrid') $('#btnAgilityHybrid')?.classList.add('active');
    if (profileName === 'pqc') $('#btnAgilityPqc')?.classList.add('active');

    $('#agilityConsoleStatus').textContent = 'PROVIDER UPDATED';
    $('#agilityConsoleDisplay').textContent =
      `Active Provider switched to: ${spec.title} (${spec.subtitle})\n\nNotice that the PaymentService controller code was NOT altered in any way.\nClick "Execute Payment Through Agile Seam ▶" to execute an ISO 20022 transfer.`;
  }

  // Setup Event Handlers
  $('#btnAgilityClassical')?.addEventListener('click', () => setProfile('classical'));
  $('#btnAgilityHybrid')?.addEventListener('click', () => setProfile('hybrid'));
  $('#btnAgilityPqc')?.addEventListener('click', () => setProfile('pqc'));

  // Execute Payment
  $('#btnExecuteAgilePayment')?.addEventListener('click', async () => {
    const btn = $('#btnExecuteAgilePayment');
    btn.disabled = true;
    btn.textContent = 'Executing Cryptographic Seam...';
    $('#agilityConsoleStatus').textContent = 'EXECUTING';

    try {
      const startTime = performance.now();
      const result = await controller.executePayment(samplePaymentPayload, sensitiveIban);
      const elapsed = (performance.now() - startTime).toFixed(1);

      $('#agilityConsoleStatus').textContent = result.status;
      $('#agilityConsoleStatus').className = 'impact-badge ' + (result.status === 'EXECUTED_SUCCESS' ? 'badge-green' : 'badge-red');

      const logOutput = {
        executionSummary: {
          status: result.status,
          totalDurationMs: parseFloat(elapsed),
          businessLogicRefactored: '0 lines (Agnostic controller)',
          activeProvider: profileSpecs[currentProfile].title,
          activeAlgorithm: profileSpecs[currentProfile].subtitle
        },
        paymentPayload: {
          messageType: result.amount ? 'pacs.008.001.08 (ISO 20022)' : 'ISO 20022 Payment',
          transactionId: result.transactionId,
          instructedAmount: `${samplePaymentPayload.instructedAmount.currency} ${samplePaymentPayload.instructedAmount.amount}`,
          recipient: samplePaymentPayload.creditor.name
        },
        signatureEnvelope: {
          algorithm: result.signatureEnvelope.algorithm || result.signatureEnvelope.profile,
          signatureSizeBytes: result.signatureEnvelope.signatureSize || 256,
          verificationResult: result.verificationResult.isValid ? 'VALID ✓ (Cryptographically Verified)' : 'FAILED ✗'
        },
        fieldProtectionEnvelope: {
          mechanism: result.accountEnvelope.mechanism,
          sensitiveField: 'Debtor Account IBAN',
          protectionEnvelopeBytes: result.accountEnvelope.totalEnvelopeBytes || result.accountEnvelope.ciphertextSize,
          quantumStatus: result.accountEnvelope.quantumStatus
        }
      };

      $('#agilityConsoleDisplay').textContent = JSON.stringify(logOutput, null, 2);

    } catch (err) {
      $('#agilityConsoleStatus').textContent = 'ERROR';
      $('#agilityConsoleStatus').className = 'impact-badge badge-red';
      $('#agilityConsoleDisplay').textContent = `Execution failed: ${err.message}\n${err.stack}`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Execute Payment Through Agile Seam ▶';
    }
  });

  // Initial Load
  setProfile('classical');

})();
