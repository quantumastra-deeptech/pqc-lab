/**
 * CryptoShift Lab — Main Application Controller
 * Orchestrates central profile changes across all 12 modules, interactive workbenches,
 * benchmarks, threat simulations, CBOM generation, and the in-browser test runner.
 */

(function () {
  'use strict';

  // Selected Profile State
  let selectedProfile = 'classical';

  // DOM Query Helpers
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // Architecture Components Data (Module 01)
  const archComponents = {
    customer: {
      step: '01 / 08',
      title: 'Customer Client Device',
      role: 'Initiates banking transaction via retail web portal or native mobile app.',
      classicalCrypto: 'TLS 1.2 / 1.3 Client, Device keystore (RSA-2048 / ECDSA P-256)',
      hybridCrypto: 'Dual TLS Key Exchange (X25519 + ML-KEM-768), App-level PQC signing support',
      pqcCrypto: 'Full FIPS 203 ML-KEM TLS Client + FIPS 204 ML-DSA Transaction Signer',
      quantumRisk: 'Low immediate risk on client device, but transaction payloads sent over public Internet are vulnerable to HNDL recording.',
      migrationTouchpoint: 'Update mobile SDKs and browser WebCrypto polyfills to support ML-KEM and ML-DSA.'
    },
    app: {
      step: '02 / 08',
      title: 'Mobile / Web Banking App',
      role: 'Constructs ISO 20022 payment payload, gathers 2FA biometrics, and formats requests.',
      classicalCrypto: 'JSON Web Signatures (JWS RS256), Local secure storage (AES-128/256)',
      hybridCrypto: 'Composite JWS (RS256 + ML-DSA-65), Hybrid KEM session bootstrap',
      pqcCrypto: 'PQC-JWS with ML-DSA-65 payload signatures, ML-KEM-768 field protection',
      quantumRisk: 'Stored device tokens signed with RSA-2048 can be forged by a future quantum computer.',
      migrationTouchpoint: 'Adopt quantum-resistant JWT/JWS formats and crypto-agile API client libraries.'
    },
    gateway: {
      step: '03 / 08',
      title: 'API Gateway & Ingress',
      role: 'Performs TLS termination, DDoS filtering, rate-limiting, and MTLS routing.',
      classicalCrypto: 'TLS Termination with RSA-2048 or ECDSA certificates, WAF inspection',
      hybridCrypto: 'Hybrid TLS 1.3 (X25519MLKEM768), Dual-certificate chain negotiation',
      pqcCrypto: 'Pure ML-KEM-768 Key Exchange + ML-DSA-65 Certificate Validation',
      quantumRisk: 'High HNDL exposure: all external incoming network traffic traverses this gateway.',
      migrationTouchpoint: 'Upgrade Envoy / NGINX / Cloud Ingress to OpenSSL 3.4+ or BoringSSL with PQC key shares.'
    },
    auth: {
      step: '04 / 08',
      title: 'Authentication Service',
      role: 'Validates customer credentials, issues OAuth2/OIDC access tokens, and enforces RBAC.',
      classicalCrypto: 'OAuth2 Tokens signed with RSA-2048 private key (OIDC RS256)',
      hybridCrypto: 'Dual-signed tokens containing both RSA and ML-DSA signatures',
      pqcCrypto: 'ML-DSA-65 Signed Access Tokens, Quantum-safe PKI verification',
      quantumRisk: 'Forged classical authentication tokens would grant unauthorized bank account access.',
      migrationTouchpoint: 'Upgrade Identity Provider (IdP) key rings to issue FIPS 204 compliant assertions.'
    },
    payment: {
      step: '05 / 08',
      title: 'Payment Core Service',
      role: 'Executes transaction validation, account balance deduction, ledger posting, and routing.',
      classicalCrypto: 'Hardcoded direct calls to legacy RSA signature libraries',
      hybridCrypto: 'CryptoProvider Seam routing calls through HybridProvider (strict dual policy)',
      pqcCrypto: 'CryptoProvider Seam routing calls through PQCProvider (ML-DSA-65 / ML-KEM-768)',
      quantumRisk: 'Critical non-repudiation risk: payment authorizations could be repudiated or forged.',
      migrationTouchpoint: 'Decouple business logic using CryptoProvider abstraction seam (Module 06).'
    },
    provider: {
      step: '06 / 08',
      title: 'Cryptographic Provider',
      role: 'Abstracts hardware/software cryptographic primitives behind a unified interface.',
      classicalCrypto: 'ClassicalProvider: RSA-PSS-2048 and RSA-OAEP-2048',
      hybridCrypto: 'HybridProvider: Combines classical + PQC with strict fallback policy',
      pqcCrypto: 'PQCProvider: FIPS 203 ML-KEM-768, FIPS 204 ML-DSA-65, AES-256-GCM',
      quantumRisk: 'Directly dictates systemic vulnerability or resilience against quantum attacks.',
      migrationTouchpoint: 'Implement CryptoProvider interface with pluggable runtime profile configuration.'
    },
    db: {
      step: '07 / 08',
      title: 'Database & Ledger Storage',
      role: 'Persists encrypted account data, transaction ledgers, audit logs, and keys.',
      classicalCrypto: 'Transparent Data Encryption (TDE) with RSA-wrapped KEKs, AES-256 tables',
      hybridCrypto: 'Dual-wrapped KEKs (RSA-2048 + ML-KEM-768), Historical signature archive',
      pqcCrypto: 'ML-KEM-768 Wrapped KEKs + AES-256-GCM Payload Data, RFC 3161 PQC Timestamps',
      quantumRisk: 'Archived backups are high-value targets for HNDL data exfiltration.',
      migrationTouchpoint: 'Rewrap existing Data Encryption Keys (DEKs) using ML-KEM without rewriting full database.'
    },
    partner: {
      step: '08 / 08',
      title: 'Banking Partner / Network',
      role: 'Clearing and settlement networks (e.g. SWIFT, Fedwire, Clearing House, Central Bank).',
      classicalCrypto: 'SWIFT PKI (RSA-2048 / SHA-256), AS4 / EBICS protocol signatures',
      hybridCrypto: 'Bilateral Hybrid Testing rails, Dual-enveloped ISO 20022 XML payments',
      pqcCrypto: 'Standardized PQC Interbank settlement messages',
      quantumRisk: 'Ecosystem dependency: cannot enforce pure PQC until correspondent banks upgrade.',
      migrationTouchpoint: 'Negotiate bilateral hybrid pilot agreements with major clearing partners.'
    }
  };

  // Change Impact Data (Module 02 / Impact Report)
  const impactData = {
    classical: {
      changed: [
        { title: 'Payment Controller Signature Calls', detail: 'Hardcoded legacy RSA-PSS calls awaiting abstraction to CryptoProvider.' },
        { title: 'Account Field Encryption Logic', detail: 'Direct RSA-OAEP field protection vulnerable to future quantum decryption.' },
        { title: 'TLS Ingress Ciphersuites', detail: 'Classical ECDHE-RSA ciphersuites vulnerable to harvest-now-decrypt-later.' }
      ],
      retained: [
        { title: 'AES-256-GCM Storage Encryption', detail: 'Symmetric bulk encryption retains 128-bit quantum security against Grover\'s algorithm.' },
        { title: 'SHA-256 & SHA-384 Hashing', detail: 'Cryptographic hash functions remain robust with adequate collision resistance.' },
        { title: 'Relational Database Schemas', detail: 'Transactional SQL tables and indexing require zero architectural schema change.' }
      ],
      compat: [
        { title: 'Hardware Security Modules (HSMs)', detail: 'Existing PKCS#11 v2.40 firmware lacks lattice math (NTT) accelerators.' },
        { title: 'SWIFT / ISO 20022 Schemas', detail: 'Clearing partners currently validate X.509 RSA-2048 certificates only.' },
        { title: 'Public CA Certificate Chains', detail: 'Commercial Certificate Authorities do not yet cross-sign pure ML-DSA roots.' }
      ]
    },
    hybrid: {
      changed: [
        { title: 'CryptoProvider Seam Deployed', detail: 'Payment business logic now calls HybridProvider enforcing strict dual verification.' },
        { title: 'Dual Signature Envelopes', detail: 'Transaction messages bundle both RSA-PSS-2048 (256 B) and ML-DSA-65 (3,309 B).' },
        { title: 'Dual Key Establishment Protocol', detail: 'Combines RSA-OAEP and ML-KEM-768 shared secrets via HKDF-SHA256 combiner.' }
      ],
      retained: [
        { title: 'AES-256-GCM Bulk Cipher', detail: 'Symmetric data payload encryption unchanged; keyed via hybrid derived secret.' },
        { title: 'Classical Audit Infrastructure', detail: 'Existing compliance tools can continue verifying the classical signature layer.' },
        { title: 'Core Banking Ledger DB', detail: 'Database continues using envelope encryption without table re-structuring.' }
      ],
      compat: [
        { title: 'Network MTU & Fragmentation', detail: 'Payloads expanded by ~3.5 KB per transaction; requires tuning TCP MSS/buffers.' },
        { title: 'HSM Dual-Slot Provisioning', detail: 'Requires allocating separate HSM slots for classical RSA and PQC lattice keys.' },
        { title: 'Clearing Partner Adapters', detail: 'Classical-only partners accept the RSA signature slice while ignoring PQC envelope.' }
      ]
    },
    pqc: {
      changed: [
        { title: 'FIPS 204 ML-DSA-65 Signatures', detail: 'Digital signatures fully transitioned to lattice-based module signatures (3,309 B).' },
        { title: 'FIPS 203 ML-KEM-768 Key Encapsulation', detail: 'Field protection and session keys established via 1,088-byte lattice ciphertexts.' },
        { title: 'Pure PQC X.509 Certificates', detail: 'Internal service-to-service mTLS uses leaf and CA certificates signed with ML-DSA.' },
        { title: 'Automated CycloneDX 1.6 CBOM', detail: 'Continuous cryptographic discovery actively audits all operational primitives.' }
      ],
      retained: [
        { title: 'AES-256-GCM Authenticated Encryption', detail: 'Retained as the universal bulk data cipher with unique 96-bit nonces and AAD.' },
        { title: 'HKDF Key Derivation Pipeline', detail: 'RFC 5869 extract-and-expand pipeline derives AES keys from ML-KEM shared secrets.' },
        { title: 'Payment Business Logic', detail: '100% identical PaymentController code thanks to the CryptoProvider seam.' }
      ],
      compat: [
        { title: 'FIPS 140-3 Hardware Token Upgrades', detail: 'Requires next-gen HSM hardware supporting lattice sampling and expanded RAM.' },
        { title: 'Interbank Network Standardization', detail: 'Full retirement of classical algorithms contingent on global SWIFT/ISO PQC mandates.' },
        { title: 'TCP Handshake Packet Budgets', detail: 'PQC certificate chains span multiple TCP packets; requires connection pooling.' }
      ]
    }
  };

  // Profile Profiles UI Data
  const profileUIData = {
    classical: {
      sign: 'RSA-PSS-2048', enc: 'RSA-OAEP-2048', meta: 'Algorithm inventory unavailable',
      signState: 'CLASSICAL (VULNERABLE)', encState: 'CLASSICAL (HNDL AT RISK)', metaState: 'LIMITED',
      status: 'Legacy profile active · High quantum vulnerability', color: '#f05b50',
      badge: 'AS-IS',
      description: 'Legacy flow selected. Public-key operations rely on integer factorization (RSA-2048). Vulnerable to Shor\'s algorithm and Harvest-Now-Decrypt-Later threats.'
    },
    pqc: {
      sign: 'ML-DSA-65 (FIPS 204)', enc: 'ML-KEM-768 + HKDF + AES-256-GCM', meta: 'CycloneDX 1.6 CBOM Validated',
      signState: 'FIPS 204 PQC SECURE', encState: 'FIPS 203 PQC ENCAPSULATION', metaState: 'INVENTORIED',
      status: 'Post-quantum profile active · FIPS 203 & 204 compliant', color: '#4bb77a',
      badge: 'TO-BE',
      description: 'PQC flow selected. ML-DSA-65 signs payments; ML-KEM-768 establishes a shared secret, derived via HKDF into an AES-256-GCM key for field encryption.'
    },
    hybrid: {
      sign: 'RSA-PSS-2048 + ML-DSA-65', enc: 'RSA-OAEP-2048 + ML-KEM-768 / AES-256-GCM', meta: 'Classical + PQC Dual Inventory Validated',
      signState: 'DUAL STRICT SIGNATURE', encState: 'DUAL KEY ESTABLISHMENT', metaState: 'INVENTORIED',
      status: 'Hybrid transition profile active · Strict dual policy', color: '#4778ee',
      badge: 'TRANSITION',
      description: 'Hybrid transition selected. Classical and post-quantum primitives execute in tandem. Both signatures must verify; shared secrets are combined via HKDF.'
    }
  };

  // Render Central Profile Across All Dependent Modules
  function applyProfile(profileName) {
    selectedProfile = profileName;
    const p = profileUIData[profileName];

    // 1. Update Profile Buttons
    $$('.profile-option').forEach(btn => {
      const active = btn.dataset.profile === selectedProfile;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    // 2. Update Environment Variable & Flow Steps
    $('#envValue').textContent = `CRYPTO_PROFILE=${selectedProfile}`;
    $('#signAlgo').textContent = p.sign;
    $('#encAlgo').textContent = p.enc;
    $('#metaAlgo').textContent = p.meta;
    $('#signState').textContent = p.signState;
    $('#encState').textContent = p.encState;
    $('#metaState').textContent = p.metaState;
    $('#resultText').textContent = p.status;
    $('#resultDot').style.background = p.color;

    // 3. Update Impact Report
    renderImpactReport(selectedProfile);

    // 4. Update Architecture Diagram Badges
    renderArchDiagram(selectedProfile);

    // 5. Update CBOM Preview
    renderCbom();

    // 6. Update Active Code Tab in Module 06
    updateCodeViewer();

    // 7. Reset live demo output
    $('#demoOutput').textContent = `Selected profile: ${selectedProfile.toUpperCase()}. Ready to run live payment demo.`;
  }

  // Render Change Impact Report
  function renderImpactReport(profileName) {
    const data = impactData[profileName] || impactData.classical;

    const fillList = (elId, items) => {
      const el = $(elId);
      if (!el) return;
      el.innerHTML = items.map(item => `
        <li>
          <strong>${item.title}</strong>
          <span>${item.detail}</span>
        </li>
      `).join('');
    };

    fillList('#impactChangedList', data.changed);
    fillList('#impactRetainedList', data.retained);
    fillList('#impactCompatList', data.compat);

    // Update count badges
    if ($('#countChanged')) $('#countChanged').textContent = `${data.changed.length} ITEMS`;
    if ($('#countRetained')) $('#countRetained').textContent = `${data.retained.length} ITEMS`;
    if ($('#countCompat')) $('#countCompat').textContent = `${data.compat.length} ITEMS`;
  }

  // Render Architecture Diagram
  function renderArchDiagram(profileName) {
    $$('.arch-card-btn').forEach(btn => {
      const compKey = btn.dataset.component;
      const comp = archComponents[compKey];
      if (!comp) return;

      const cryptoLabelEl = btn.querySelector('.node-crypto');
      if (cryptoLabelEl) {
        if (profileName === 'pqc') {
          cryptoLabelEl.textContent = comp.pqcCrypto.split(',')[0].substring(0, 18) + '...';
          cryptoLabelEl.style.color = '#23854e';
        } else if (profileName === 'hybrid') {
          cryptoLabelEl.textContent = 'Hybrid Dual Layer';
          cryptoLabelEl.style.color = '#4778ee';
        } else {
          cryptoLabelEl.textContent = comp.classicalCrypto.split(',')[0].substring(0, 18) + '...';
          cryptoLabelEl.style.color = '#d94b40';
        }
      }
    });

    // Update active inspector if one is open
    const activeBtn = $('.arch-card-btn.active') || $('.arch-card-btn');
    if (activeBtn) {
      inspectArchComponent(activeBtn.dataset.component);
    }
  }

  // Inspect Single Architecture Component
  function inspectArchComponent(compKey) {
    const comp = archComponents[compKey];
    if (!comp) return;

    $$('.arch-card-btn').forEach(b => b.classList.toggle('active', b.dataset.component === compKey));

    const drawer = $('#archInspector');
    if (!drawer) return;

    drawer.innerHTML = `
      <div>
        <span class="mod-num">${comp.step} COMPONENT INSPECTOR</span>
        <h4>${comp.title}</h4>
        <p style="font-size:12px; color:#5c6068; line-height:1.7; margin-bottom:16px;">${comp.role}</p>
        <table class="arch-prop-table">
          <tr><td>QUANTUM RISK</td><td><span class="impact-badge badge-red">${comp.quantumRisk}</span></td></tr>
          <tr><td>MIGRATION ACTION</td><td><strong>${comp.migrationTouchpoint}</strong></td></tr>
        </table>
      </div>
      <div>
        <span class="mod-num">CRYPTOGRAPHIC EVOLUTION</span>
        <table class="arch-prop-table">
          <tr><td>CLASSICAL (AS-IS)</td><td><code>${comp.classicalCrypto}</code></td></tr>
          <tr><td>HYBRID TRANSITION</td><td><code>${comp.hybridCrypto}</code></td></tr>
          <tr><td>POST-QUANTUM (TO-BE)</td><td><strong style="color:var(--green);">${comp.pqcCrypto}</strong></td></tr>
        </table>
      </div>
    `;
  }

  // Render CBOM JSON Preview & Schema Status
  function renderCbom() {
    if (typeof CbomGenerator === 'undefined') return;
    const doc = CbomGenerator.generateCbom(selectedProfile);
    const val = CbomGenerator.validateCbom(doc);

    $('#jsonProfile').textContent = `crypto-inventory-${selectedProfile}.json`;
    $('#jsonPreview').textContent = JSON.stringify(doc, null, 2);

    const statusEl = $('#cbomValidationStatus');
    if (statusEl) {
      if (val.isValid) {
        statusEl.innerHTML = `<span class="impact-badge badge-green">✓ CycloneDX 1.6 CBOM Validated (${val.componentsCount} Assets, 0 Private Keys Leaked)</span>`;
      } else {
        statusEl.innerHTML = `<span class="impact-badge badge-red">✕ Schema Validation Errors: ${val.errors.join('; ')}</span>`;
      }
    }
  }

  // Update Code Viewer for Module 06
  const codeSnippets = {
    controller: `// PaymentController.ts — Zero Cryptographic Coupling
import { CryptoProvider, SignedPayment, ProtectedField } from './CryptoProvider';

export class PaymentController {
  constructor(private readonly cryptoProvider: CryptoProvider) {}

  async processPayment(request: PaymentRequest): Promise<PaymentReceipt> {
    // 1. Business logic expresses intent: "sign this payment"
    const signedPayload = await this.cryptoProvider.signPayment(request);

    // 2. Protect sensitive customer PAN/IBAN
    const protectedAccount = await this.cryptoProvider.protectField(
      request.sourceAccount,
      request.transactionId
    );

    // 3. Transmit to settlement clearing partner
    return this.clearingGateway.send(signedPayload, protectedAccount);
  }
}`,
    providerInterface: `// CryptoProvider.ts — Stable Abstraction Seam
export interface CryptoProvider {
  readonly profileName: 'classical' | 'hybrid' | 'pqc';
  
  signPayment(payload: object): Promise<SignedPaymentEnvelope>;
  verifyPayment(payload: object, envelope: SignedPaymentEnvelope): Promise<VerificationResult>;
  protectField(data: string, aad?: string): Promise<ProtectedFieldEnvelope>;
  unprotectField(envelope: ProtectedFieldEnvelope, aad?: string): Promise<string>;
  getMetadata(): ProviderMetadata;
}`,
    classicalProvider: `// ClassicalProvider.ts — Legacy RSA Implementation
import { CryptoProvider } from './CryptoProvider';

export class ClassicalProvider implements CryptoProvider {
  readonly profileName = 'classical';

  async signPayment(payload: object) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    const sig = await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, this.rsaKey, bytes);
    return { algorithm: 'RSA-PSS-2048', signature: bytesToHex(new Uint8Array(sig)) };
  }

  async protectField(data: string) {
    const bytes = new TextEncoder().encode(data);
    const ct = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, this.rsaPub, bytes);
    return { mechanism: 'RSA-OAEP-2048', ciphertext: bytesToHex(new Uint8Array(ct)) };
  }
}`,
    hybridProvider: `// HybridProvider.ts — Strict Dual Verification Policy
import { CryptoProvider } from './CryptoProvider';

export class HybridProvider implements CryptoProvider {
  readonly profileName = 'hybrid';

  async signPayment(payload: object) {
    // Execute both classical RSA-PSS and post-quantum ML-DSA-65 in parallel
    const [rsaSig, mlDsaSig] = await Promise.all([
      this.classical.signPayment(payload),
      this.pqc.signPayment(payload)
    ]);
    return { classical: rsaSig, pqc: mlDsaSig };
  }

  async verifyPayment(payload: object, envelope: any) {
    // STRICT_BOTH_REQUIRED: Downgrade attack blocked if either signature is missing/invalid
    const [vClassic, vPqc] = await Promise.all([
      this.classical.verifyPayment(payload, envelope.classical),
      this.pqc.verifyPayment(payload, envelope.pqc)
    ]);
    return { isValid: vClassic.isValid && vPqc.isValid };
  }
}`,
    pqcProvider: `// PQCProvider.ts — FIPS 203 & 204 Implementation
import { CryptoProvider } from './CryptoProvider';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { ml_kem768 } from '@noble/post-quantum/ml-kem';

export class PQCProvider implements CryptoProvider {
  readonly profileName = 'pqc';

  async signPayment(payload: object) {
    const msg = new TextEncoder().encode(JSON.stringify(payload));
    const sig = ml_dsa65.sign(msg, this.mlDsaSecretKey); // 3,309 bytes signature
    return { algorithm: 'ML-DSA-65 (FIPS 204)', signature: bytesToHex(sig) };
  }

  async protectField(data: string, aad: string) {
    // 1. KEM Encapsulation (1,088 bytes ciphertext)
    const { cipherText, sharedSecret } = ml_kem768.encapsulate(this.recipientPubKey);
    // 2. HKDF-SHA256 Derivation -> 256-bit AES key
    const aesKey = await deriveAesKeyHkdf(sharedSecret, salt);
    // 3. AES-256-GCM Authenticated Encryption with unique nonce
    const encrypted = await encryptAesGcm(aesKey, data, aad);
    return { kemCiphertext: bytesToHex(cipherText), encryptedPayload: encrypted };
  }
}`
  };

  let activeCodeTab = 'controller';
  function updateCodeViewer() {
    const block = $('#codeBlock');
    if (!block) return;
    block.textContent = codeSnippets[activeCodeTab] || codeSnippets.controller;
  }

  // --- Wire Up Interactive Modules ---

  // 1. Profile selector clicks
  $$('.profile-option').forEach(btn => btn.addEventListener('click', () => {
    applyProfile(btn.dataset.profile);
  }));

  // 2. Architecture Diagram Node Clicks
  $$('.arch-card-btn').forEach(btn => btn.addEventListener('click', () => {
    inspectArchComponent(btn.dataset.component);
  }));

  // 3. Algorithm Matrix Filter Tabs (Module 02)
  $$('.matrix-tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.matrix-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    const filter = btn.dataset.filter;
    $$('.algo-row').forEach(row => {
      const match = filter === 'all' || row.dataset.category === filter;
      row.style.display = match ? '' : 'none';
    });
  }));

  // 4. Code Viewer Tabs (Module 06)
  $$('.code-tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.code-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    activeCodeTab = btn.dataset.tab;
    updateCodeViewer();
  }));

  // 5. Run Live Payment Demo (Playground)
  $('#runDemo').addEventListener('click', async () => {
    if (typeof CryptoProviders === 'undefined') return;
    const provider = CryptoProviders.getProvider(selectedProfile);
    const controller = new CryptoProviders.PaymentController(provider);

    $('#demoOutput').innerHTML = `<i>Executing payment through ${selectedProfile.toUpperCase()} provider...</i>`;

    const payload = {
      transactionId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      fromAccount: '•••• 4821',
      recipient: 'National Clearing Hub',
      amount: '₹ 12,500.00',
      currency: 'INR',
      timestamp: new Date().toISOString()
    };

    try {
      const receipt = await controller.executePayment(payload, '4821-9902-8812-7391');
      const sigSize = receipt.signatureEnvelope.signatureSize || (receipt.signatureEnvelope.signatureBytes ? receipt.signatureEnvelope.signatureBytes.length : 256);

      $('#demoOutput').innerHTML = `
        <div style="color:var(--green); font-weight:700;">✓ PAYMENT EXECUTED & VERIFIED SUCCESSFULLY [${receipt.status}]</div>
        <div>Transaction ID: <b>${receipt.transactionId}</b> | Amount: <b>${receipt.amount}</b></div>
        <div>Signature Primitive: <b>${receipt.signatureEnvelope.algorithm}</b> (${sigSize.toLocaleString()} bytes) in ${receipt.signatureEnvelope.durationMs.toFixed(1)} ms</div>
        <div>Field Protection: <b>${receipt.accountEnvelope.mechanism}</b> in ${receipt.accountEnvelope.durationMs.toFixed(1)} ms</div>
        <div style="color:#aeb2ba; font-size:9px; margin-top:4px;">${receipt.signatureEnvelope.quantumStatus}</div>
      `;
    } catch (err) {
      $('#demoOutput').innerHTML = `<span style="color:var(--red);">Payment execution failed: ${err.message}</span>`;
    }
  });

  // 6. Interactive Signature Workbench (Module 03)
  let sigWorkbenchKeys = null;
  let lastGeneratedSig = null;

  $('#btnGenerateSigKeys')?.addEventListener('click', async () => {
    const isPqc = $('#sigAlgoSelect').value === 'mldsa';
    $('#sigKeyDetails').textContent = 'Generating real cryptographic keypair...';

    if (isPqc) {
      sigWorkbenchKeys = await CryptoCore.generateMlDsa65Keypair();
      $('#sigKeyDetails').innerHTML = `
        <strong>Algorithm:</strong> ML-DSA-65 (NIST FIPS 204)<br>
        <strong>Public Key Size:</strong> ${sigWorkbenchKeys.publicKeySize} bytes (1.95 KB)<br>
        <strong>Secret Key Size:</strong> ${sigWorkbenchKeys.secretKeySize} bytes (4.03 KB)<br>
        <strong>Generation Time:</strong> ${sigWorkbenchKeys.durationMs.toFixed(1)} ms<br>
        <strong>Public Key (First 64 hex chars):</strong> <code>${sigWorkbenchKeys.publicKeyHex.substring(0, 64)}...</code>
      `;
    } else {
      sigWorkbenchKeys = await CryptoCore.generateRsaPssKeypair();
      $('#sigKeyDetails').innerHTML = `
        <strong>Algorithm:</strong> RSA-PSS-2048 (SHA-256, Salt: 32)<br>
        <strong>Public Key Size:</strong> ${sigWorkbenchKeys.publicKeyBytes} bytes<br>
        <strong>Private Key Size:</strong> ~${sigWorkbenchKeys.privateKeyBytes} bytes<br>
        <strong>Public Key (First 64 hex chars):</strong> <code>${sigWorkbenchKeys.publicKeyHex.substring(0, 64)}...</code>
      `;
    }
    $('#sigWorkbenchOutput').textContent = 'Keypair ready. Click "Sign Payment Payload" to compute cryptographic signature.';
  });

  $('#btnSignPayment')?.addEventListener('click', async () => {
    if (!sigWorkbenchKeys) {
      $('#sigWorkbenchOutput').textContent = 'Please generate a keypair first.';
      return;
    }
    const payloadText = $('#sigPaymentInput').value;
    const isPqc = sigWorkbenchKeys.algorithm.includes('ML-DSA');

    if (isPqc) {
      lastGeneratedSig = await CryptoCore.signMlDsa65(sigWorkbenchKeys.secretKeyBytes, CryptoCore.utf8ToBytes(payloadText));
    } else {
      lastGeneratedSig = await CryptoCore.signRsaPss(sigWorkbenchKeys.keyPair.privateKey, CryptoCore.utf8ToBytes(payloadText));
    }

    $('#sigWorkbenchOutput').innerHTML = `
      <div style="color:var(--green); font-weight:700;">✓ SIGNATURE COMPUTED (${lastGeneratedSig.sizeBytes.toLocaleString()} bytes in ${lastGeneratedSig.durationMs.toFixed(1)} ms)</div>
      <div style="margin-top:6px; word-break:break-all;"><strong>Signature Hex (First 120 chars):</strong><br><code>${lastGeneratedSig.signatureHex.substring(0, 120)}...</code></div>
      <div style="margin-top:6px; color:#aeb2ba;">Now click "Verify Signature" or "Tamper Payload (Simulate Attack)" to test integrity.</div>
    `;
  });

  $('#btnVerifySig')?.addEventListener('click', async () => {
    if (!sigWorkbenchKeys || !lastGeneratedSig) {
      $('#sigWorkbenchOutput').textContent = 'Generate keys and compute a signature first.';
      return;
    }
    const payloadText = $('#sigPaymentInput').value;
    const isPqc = sigWorkbenchKeys.algorithm.includes('ML-DSA');

    let ver;
    if (isPqc) {
      ver = await CryptoCore.verifyMlDsa65(sigWorkbenchKeys.publicKeyBytes, CryptoCore.utf8ToBytes(payloadText), lastGeneratedSig.signatureBytes);
    } else {
      ver = await CryptoCore.verifyRsaPss(sigWorkbenchKeys.keyPair.publicKey, CryptoCore.utf8ToBytes(payloadText), lastGeneratedSig.signatureBytes);
    }

    if (ver.isValid) {
      $('#sigWorkbenchOutput').innerHTML = `
        <div style="color:var(--green); font-weight:800; font-size:12px;">✓ SIGNATURE VERIFIED: VALID PAYMENT AUTHENTICATION</div>
        <div>Payload integrity confirmed in ${ver.durationMs.toFixed(1)} ms. No tampering detected.</div>
      `;
    } else {
      $('#sigWorkbenchOutput').innerHTML = `
        <div style="color:var(--red); font-weight:800; font-size:12px;">✕ SIGNATURE REJECTED: VERIFICATION FAILED</div>
        <div>The signature does not mathematically match the current payload text!</div>
      `;
    }
  });

  $('#btnTamperPayment')?.addEventListener('click', () => {
    const input = $('#sigPaymentInput');
    try {
      const obj = JSON.parse(input.value);
      obj.amount = (parseFloat(obj.amount) || 12500) + 80000; // Alter amount!
      obj.recipient = 'ATTACKER-ACCOUNT-FRAUD';
      input.value = JSON.stringify(obj, null, 2);
      $('#sigWorkbenchOutput').innerHTML = `
        <div style="color:var(--yellow); font-weight:700;">⚠ PAYLOAD TAMPERED (Amount changed to ₹${obj.amount.toLocaleString()})</div>
        <div>Now click "Verify Signature" to observe cryptographic rejection.</div>
      `;
    } catch {
      input.value = input.value + ' [TAMPERED]';
    }
  });

  // 7. Interactive Key Establishment & Encryption Workbench (Module 04)
  let kemWorkbenchKeys = null;
  let lastKemEnvelope = null;

  $('#btnKemKeygen')?.addEventListener('click', async () => {
    $('#kemWorkbenchOutput').textContent = 'Generating ML-KEM-768 keypair...';
    kemWorkbenchKeys = await CryptoCore.generateMlKem768Keypair();
    $('#kemKeyDetails').innerHTML = `
      <strong>Algorithm:</strong> ML-KEM-768 (NIST FIPS 203)<br>
      <strong>Public Key:</strong> 1,184 bytes (Category 3 Security)<br>
      <strong>Secret Key:</strong> 2,400 bytes<br>
      <strong>Generation Time:</strong> ${kemWorkbenchKeys.durationMs.toFixed(1)} ms<br>
      <strong>Public Key (First 48 hex):</strong> <code>${kemWorkbenchKeys.publicKeyHex.substring(0, 48)}...</code>
    `;
    $('#kemWorkbenchOutput').textContent = 'ML-KEM-768 keypair ready. Click "Encapsulate & Encrypt Field".';
  });

  $('#btnKemEncrypt')?.addEventListener('click', async () => {
    if (!kemWorkbenchKeys) {
      $('#kemWorkbenchOutput').textContent = 'Please generate ML-KEM-768 keys first.';
      return;
    }
    const fieldText = $('#kemPlaintextInput').value;
    const aad = 'TX-AAD-9021';
    lastKemEnvelope = await CryptoCore.protectFieldPqc(kemWorkbenchKeys.publicKeyBytes, fieldText, aad);

    $('#kemWorkbenchOutput').innerHTML = `
      <div style="color:var(--green); font-weight:700;">✓ FIELD ENCAPSULATED & ENCRYPTED</div>
      <div>1. ML-KEM-768 Ciphertext: <b>${lastKemEnvelope.kemCiphertextBytes.length} bytes</b> in ${lastKemEnvelope.encapsulationDurationMs.toFixed(1)} ms</div>
      <div>2. Derived Shared Secret: <b>32 bytes (256-bit)</b> via HKDF-SHA256</div>
      <div>3. AES-256-GCM Payload: <b>${lastKemEnvelope.totalEnvelopeBytes} total bytes</b> (Nonce: 96-bit, Auth Tag: 128-bit)</div>
      <div style="margin-top:6px; word-break:break-all;"><strong>Auth Tag:</strong> <code>${lastKemEnvelope.authTagHex}</code></div>
    `;
  });

  $('#btnKemDecrypt')?.addEventListener('click', async () => {
    if (!kemWorkbenchKeys || !lastKemEnvelope) {
      $('#kemWorkbenchOutput').textContent = 'Perform encapsulation and encryption first.';
      return;
    }
    try {
      const res = await CryptoCore.unprotectFieldPqc(kemWorkbenchKeys.secretKeyBytes, lastKemEnvelope, 'TX-AAD-9021');
      $('#kemWorkbenchOutput').innerHTML = `
        <div style="color:var(--green); font-weight:800;">✓ DECAPSULATION & DECRYPTION SUCCESSFUL</div>
        <div>Recovered Plaintext: <b>${res.plaintextContent}</b></div>
        <div>ML-KEM Decapsulation: ${res.decapsulationDurationMs.toFixed(1)} ms | AES-GCM Tag Verified: ${res.decryptionDurationMs.toFixed(1)} ms</div>
      `;
    } catch (e) {
      $('#kemWorkbenchOutput').innerHTML = `<div style="color:var(--red); font-weight:800;">✕ AUTHENTICATED DECRYPTION FAILED: ${e.message}</div>`;
    }
  });

  $('#btnCorruptCiphertext')?.addEventListener('click', () => {
    if (!lastKemEnvelope) return;
    lastKemEnvelope.fullEncryptedBuffer[0] ^= 0xFF; // Corrupt ciphertext byte
    $('#kemWorkbenchOutput').innerHTML = `
      <div style="color:var(--yellow); font-weight:700;">⚠ CIPHERTEXT BYTE CORRUPTED IN MEMORY</div>
      <div>Click "Decapsulate & Decrypt Field" to test AES-GCM Galois authentication tag rejection.</div>
    `;
  });

  // 8. Performance Benchmark Suite (Module 10)
  $('#btnRunBenchmark')?.addEventListener('click', async () => {
    if (typeof Benchmarks === 'undefined') return;
    const btn = $('#btnRunBenchmark');
    btn.disabled = true;
    btn.textContent = 'Running live cryptographic benchmarks...';

    const results = await Benchmarks.runSingleBenchmark(2);

    // Update table cells
    $('#benchRsaSign').textContent = `${results.classical.signature.signMs.toFixed(1)} ms`;
    $('#benchRsaVerify').textContent = `${results.classical.signature.verifyMs.toFixed(1)} ms`;
    $('#benchRsaSigSize').textContent = `${results.classical.signature.signatureBytes} B`;

    $('#benchDsaSign').textContent = `${results.pqc.signature.signMs.toFixed(1)} ms`;
    $('#benchDsaVerify').textContent = `${results.pqc.signature.verifyMs.toFixed(1)} ms`;
    $('#benchDsaSigSize').textContent = `${results.pqc.signature.signatureBytes.toLocaleString()} B`;

    $('#benchRsaEnc').textContent = `${results.classical.encryption.encryptMs.toFixed(1)} ms`;
    $('#benchRsaDec').textContent = `${results.classical.encryption.decryptMs.toFixed(1)} ms`;
    $('#benchRsaCtSize').textContent = `${results.classical.encryption.ciphertextBytes} B`;

    $('#benchKemEncap').textContent = `${results.pqc.encryption.encapMs.toFixed(1)} ms`;
    $('#benchKemDecap').textContent = `${results.pqc.encryption.decapMs.toFixed(1)} ms`;
    $('#benchKemCtSize').textContent = `${results.pqc.encryption.kemCiphertextBytes.toLocaleString()} B`;

    $('#benchEnvDetails').textContent = `${results.environment.platform} · Cores: ${results.environment.logicalCores} · WebCrypto Subtle Active`;
    $('#benchExpansionRatio').textContent = `${results.comparisons.signatureSizeExpansionRatio}×`;

    btn.disabled = false;
    btn.textContent = 'Re-Run Performance Benchmark ↻';
  });

  // 9. Threat Lab Triggers (Module 11)
  $$('.threat-run-btn').forEach(btn => btn.addEventListener('click', async () => {
    const threatId = btn.dataset.threat;
    if (typeof ThreatLab === 'undefined') return;
    const threat = ThreatLab.threats.find(t => t.id === threatId);
    if (!threat) return;

    btn.disabled = true;
    btn.textContent = 'Running...';
    const outcome = await threat.simulate();
    btn.disabled = false;
    btn.textContent = 'Test Again';

    const resultBox = $(`#threatRes_${threatId}`);
    if (resultBox) {
      resultBox.classList.add('visible');
      resultBox.innerHTML = `
        <div style="color:var(--green); font-weight:700; margin-bottom:4px;">EXPERIMENT RESULT: ${outcome.testResult || outcome.status || 'SIMULATION COMPLETE'}</div>
        <pre style="margin:0; font:9px/1.6 var(--mono); white-space:pre-wrap;">${JSON.stringify(outcome, null, 2)}</pre>
      `;
    }
  }));

  // 10. Automated In-Browser Test Suite Runner (Section 6)
  $('#btnRunTestSuite')?.addEventListener('click', async () => {
    if (typeof TestSuite === 'undefined') return;
    const btn = $('#btnRunTestSuite');
    btn.disabled = true;
    btn.textContent = 'Executing 12 automated tests...';

    const tableBody = $('#testTableBody');
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:18px;">Running cryptographic and system assertions...</td></tr>';

    const report = await TestSuite.runAllTests();

    tableBody.innerHTML = report.results.map((r, i) => `
      <tr>
        <td style="font:9px var(--mono); color:var(--muted);">${String(i + 1).padStart(2, '0')}</td>
        <td><strong>${r.name}</strong></td>
        <td><span class="test-status-pill ${r.passed ? 'pill-pass' : 'pill-fail'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
        <td style="font:10px var(--mono); color:${r.passed ? '#23854e' : 'var(--red)'};">${r.passed ? r.message : r.error} (${r.durationMs.toFixed(1)} ms)</td>
      </tr>
    `).join('');

    $('#testSuiteSummary').innerHTML = `
      <span class="impact-badge ${report.allPassed ? 'badge-green' : 'badge-red'}">
        ${report.passedCount}/${report.totalTests} TESTS PASSED in ${report.totalDurationMs.toFixed(1)} ms
      </span>
    `;

    btn.disabled = false;
    btn.textContent = 'Re-Run Test Suite ↻';
  });

  // 11. Copy & Download CBOM
  $('#copyJson')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#jsonPreview').textContent);
      $('#copyJson').textContent = 'Copied!';
    } catch {
      $('#copyJson').textContent = 'Copy failed';
    }
    setTimeout(() => { $('#copyJson').textContent = 'Copy'; }, 1500);
  });

  $('#downloadCbom')?.addEventListener('click', () => {
    if (typeof CbomGenerator === 'undefined') return;
    const data = JSON.stringify(CbomGenerator.generateCbom(selectedProfile), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-inventory-${selectedProfile}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  $('#copyEnv')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#envValue').textContent);
      $('#copyEnv').textContent = '✓';
    } catch {
      $('#copyEnv').textContent = '✕';
    }
    setTimeout(() => { $('#copyEnv').textContent = '▢'; }, 1500);
  });

  // 12. Roadmap Checklist Progress Meter
  $$('.chk-box').forEach(chk => chk.addEventListener('change', () => {
    const total = $$('.chk-box').length;
    const checked = $$('.chk-box:checked').length;
    const pct = Math.round((checked / total) * 100);
    const fill = $('#checklistFill');
    const label = $('#checklistProgressText');
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${pct}% (${checked}/${total} items verified)`;
  }));

  // Mobile Menu Toggle
  $('#menuToggle')?.addEventListener('click', () => {
    const nav = $('.topnav');
    const open = nav.classList.toggle('open');
    $('#menuToggle').setAttribute('aria-expanded', String(open));
    $('#menuToggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  $$('.topnav a').forEach(a => a.addEventListener('click', () => {
    $('.topnav').classList.remove('open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
  }));

  // Initial Boot
  applyProfile('classical');
  inspectArchComponent('customer');

})();
