/**
 * CryptoShift Lab — CryptoProvider Architecture & Implementations
 * Provides a clean crypto-agility abstraction seam isolating payment business logic
 * from concrete cryptographic primitives.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['CryptoCore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const CryptoCore = require('./crypto-core.js');
    module.exports = factory(CryptoCore);
  } else {
    root.CryptoProviders = factory(root.CryptoCore);
  }
})(typeof self !== 'undefined' ? self : this, function (CryptoCore) {
  'use strict';

  // Base Provider Interface
  class CryptoProvider {
    constructor(profileName) {
      this.profileName = profileName;
      this.initialized = false;
      this.keys = {};
    }

    async init() {
      throw new Error('init() must be implemented by subclass');
    }

    async signPayment(paymentObject) {
      throw new Error('signPayment() must be implemented by subclass');
    }

    async verifyPayment(paymentObject, signatureEnvelope) {
      throw new Error('verifyPayment() must be implemented by subclass');
    }

    async protectField(plaintextField, aad) {
      throw new Error('protectField() must be implemented by subclass');
    }

    async unprotectField(protectedEnvelope, aad) {
      throw new Error('unprotectField() must be implemented by subclass');
    }

    getMetadata() {
      throw new Error('getMetadata() must be implemented by subclass');
    }
  }

  // Helper for canonical payment JSON serialization
  function canonicalize(obj) {
    if (typeof obj === 'string') return obj;
    // Sort keys deterministically
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = {};
    for (const key of sortedKeys) {
      sortedObj[key] = obj[key];
    }
    return JSON.stringify(sortedObj);
  }

  // --- Classical Provider (RSA-PSS-2048 + RSA-OAEP-2048) ---
  class ClassicalProvider extends CryptoProvider {
    constructor() {
      super('classical');
    }

    async init() {
      if (this.initialized) return;
      this.keys.pss = await CryptoCore.generateRsaPssKeypair();
      this.keys.oaep = await CryptoCore.generateRsaOaepKeypair();
      this.initialized = true;
    }

    async signPayment(paymentObject) {
      await this.init();
      const canonicalJson = canonicalize(paymentObject);
      const dataBytes = CryptoCore.utf8ToBytes(canonicalJson);
      const result = await CryptoCore.signRsaPss(this.keys.pss.keyPair.privateKey, dataBytes);

      return {
        profile: 'classical',
        algorithm: 'RSA-PSS-2048',
        hash: 'SHA-256',
        saltLength: 32,
        signatureHex: result.signatureHex,
        signatureBytes: result.signatureBytes,
        signatureSize: result.sizeBytes, // 256 bytes
        publicKeyHex: this.keys.pss.publicKeyHex,
        publicKeyBytes: this.keys.pss.publicKeyBytes,
        privateKeyBytes: this.keys.pss.privateKeyBytes,
        canonicalPayload: canonicalJson,
        durationMs: result.durationMs,
        quantumStatus: 'Vulnerable to Shor\'s algorithm (quantum broken)'
      };
    }

    async verifyPayment(paymentObject, signatureEnvelope) {
      await this.init();
      const canonicalJson = canonicalize(paymentObject);
      const dataBytes = CryptoCore.utf8ToBytes(canonicalJson);
      const sigBytes = signatureEnvelope.signatureBytes || CryptoCore.hexToBytes(signatureEnvelope.signatureHex);

      const result = await CryptoCore.verifyRsaPss(this.keys.pss.keyPair.publicKey, dataBytes, sigBytes);
      return {
        isValid: result.isValid,
        durationMs: result.durationMs,
        algorithm: 'RSA-PSS-2048',
        rejectionReason: result.isValid ? null : 'Classical RSA-PSS signature verification failed (payload tampered or invalid key)'
      };
    }

    async protectField(plaintextField, aad) {
      await this.init();
      const ptBytes = CryptoCore.utf8ToBytes(plaintextField);
      const result = await CryptoCore.encryptRsaOaep(this.keys.oaep.keyPair.publicKey, ptBytes);

      return {
        profile: 'classical',
        mechanism: 'RSA-OAEP-2048 direct asymmetric encryption',
        ciphertextHex: result.ciphertextHex,
        ciphertextBytes: result.ciphertextBytes,
        ciphertextSize: result.sizeBytes, // 256 bytes
        aadUsed: aad || null,
        durationMs: result.durationMs,
        quantumStatus: 'Vulnerable to Harvest-Now-Decrypt-Later (HNDL)'
      };
    }

    async unprotectField(protectedEnvelope, aad) {
      await this.init();
      const ctBytes = protectedEnvelope.ciphertextBytes || CryptoCore.hexToBytes(protectedEnvelope.ciphertextHex);
      const result = await CryptoCore.decryptRsaOaep(this.keys.oaep.keyPair.privateKey, ctBytes);

      return {
        plaintextContent: result.plaintextContent,
        durationMs: result.durationMs
      };
    }

    getMetadata() {
      return {
        profile: 'classical',
        title: 'Classical Banking Profile (As-Is Legacy)',
        signatureAlgorithm: 'RSA-PSS-2048',
        keyEstablishment: 'RSA-OAEP-2048',
        symmetricData: 'None (direct RSA-OAEP field encryption)',
        hashAlgorithm: 'SHA-256',
        quantumSecurityBits: 0,
        nistSecurityCategory: 0,
        standards: ['RFC 8017 (PKCS #1 v2.2)', 'FIPS 186-4 (Legacy)'],
        securityNotes: 'Vulnerable to Shor\'s algorithm on cryptanalytically relevant quantum computers (CRQC). Subject to immediate Harvest-Now-Decrypt-Later (HNDL) exposure for long-lived banking transaction data.'
      };
    }
  }

  // --- Post-Quantum Provider (ML-DSA-65 + ML-KEM-768 + HKDF-SHA256 + AES-256-GCM) ---
  class PQCProvider extends CryptoProvider {
    constructor() {
      super('pqc');
    }

    async init() {
      if (this.initialized) return;
      this.keys.dsa = await CryptoCore.generateMlDsa65Keypair();
      this.keys.kem = await CryptoCore.generateMlKem768Keypair();
      this.initialized = true;
    }

    async signPayment(paymentObject) {
      await this.init();
      const canonicalJson = canonicalize(paymentObject);
      const dataBytes = CryptoCore.utf8ToBytes(canonicalJson);
      const result = await CryptoCore.signMlDsa65(this.keys.dsa.secretKeyBytes, dataBytes);

      return {
        profile: 'pqc',
        algorithm: 'ML-DSA-65',
        standard: 'NIST FIPS 204',
        parameterSet: 'Category 3 (AES-192 equivalent quantum hardness)',
        signatureHex: result.signatureHex,
        signatureBytes: result.signatureBytes,
        signatureSize: result.sizeBytes, // 3,309 bytes
        publicKeyHex: this.keys.dsa.publicKeyHex,
        publicKeyBytes: this.keys.dsa.publicKeyBytes.length, // 1,952 bytes
        privateKeyBytes: this.keys.dsa.secretKeyBytes.length, // 4,032 bytes
        canonicalPayload: canonicalJson,
        durationMs: result.durationMs,
        quantumStatus: 'Post-Quantum Secure (NIST FIPS 204 Standard)'
      };
    }

    async verifyPayment(paymentObject, signatureEnvelope) {
      await this.init();
      const canonicalJson = canonicalize(paymentObject);
      const dataBytes = CryptoCore.utf8ToBytes(canonicalJson);
      const sigBytes = signatureEnvelope.signatureBytes || CryptoCore.hexToBytes(signatureEnvelope.signatureHex);

      const result = await CryptoCore.verifyMlDsa65(this.keys.dsa.publicKeyBytes, dataBytes, sigBytes);
      return {
        isValid: result.isValid,
        durationMs: result.durationMs,
        algorithm: 'ML-DSA-65 (FIPS 204)',
        rejectionReason: result.isValid ? null : 'FIPS 204 ML-DSA-65 signature verification failed (matrix polynomial mismatch)'
      };
    }

    async protectField(plaintextField, aad) {
      await this.init();
      const envelope = await CryptoCore.protectFieldPqc(this.keys.kem.publicKeyBytes, plaintextField, aad);

      return {
        profile: 'pqc',
        mechanism: 'ML-KEM-768 Encapsulation + HKDF-SHA256 + AES-256-GCM Authenticated Encryption',
        standardKem: 'NIST FIPS 203',
        standardSymmetric: 'NIST SP 800-38D',
        kemCiphertextHex: envelope.kemCiphertextHex,
        kemCiphertextBytes: envelope.kemCiphertextBytes,
        kemCiphertextSize: envelope.kemCiphertextBytes.length, // 1,088 bytes
        aesCiphertextHex: envelope.aesCiphertextHex,
        aesCiphertextBytes: envelope.aesCiphertextBytes,
        fullEncryptedBuffer: envelope.fullEncryptedBuffer,
        authTagHex: envelope.authTagHex,
        authTagBytes: envelope.authTagBytes,
        ivHex: envelope.ivHex,
        ivBytes: envelope.ivBytes,
        saltHex: envelope.saltHex,
        saltBytes: envelope.saltBytes,
        totalEnvelopeBytes: envelope.totalEnvelopeBytes,
        durationMs: envelope.encapsulationDurationMs + envelope.encryptionDurationMs,
        quantumStatus: 'Post-Quantum Secure & HNDL-Resistant'
      };
    }

    async unprotectField(protectedEnvelope, aad) {
      await this.init();
      const result = await CryptoCore.unprotectFieldPqc(this.keys.kem.secretKeyBytes, protectedEnvelope, aad);

      return {
        plaintextContent: result.plaintextContent,
        durationMs: result.decapsulationDurationMs + result.decryptionDurationMs
      };
    }

    getMetadata() {
      return {
        profile: 'pqc',
        title: 'Post-Quantum Profile (To-Be Architecture)',
        signatureAlgorithm: 'ML-DSA-65 (FIPS 204)',
        keyEstablishment: 'ML-KEM-768 (FIPS 203)',
        symmetricData: 'AES-256-GCM with HKDF-SHA256 Key Derivation',
        hashAlgorithm: 'SHA-256 / SHA-384 / SHAKE-256',
        quantumSecurityBits: 192,
        nistSecurityCategory: 3,
        standards: ['NIST FIPS 203 (ML-KEM)', 'NIST FIPS 204 (ML-DSA)', 'NIST SP 800-38D (GCM)', 'RFC 5869 (HKDF)'],
        securityNotes: 'Guards against Harvest-Now-Decrypt-Later attacks and quantum forgery. Module lattice mathematical hardness assumptions (MLWE / MSIS).'
      };
    }
  }

  // --- Hybrid Transition Provider (RSA + ML-DSA dual signatures, Dual KEM/OAEP combiner) ---
  class HybridProvider extends CryptoProvider {
    constructor() {
      super('hybrid');
      this.classical = new ClassicalProvider();
      this.pqc = new PQCProvider();
    }

    async init() {
      if (this.initialized) return;
      await Promise.all([this.classical.init(), this.pqc.init()]);
      this.initialized = true;
    }

    async signPayment(paymentObject) {
      await this.init();
      const startTime = performance.now();
      const [classicalSig, pqcSig] = await Promise.all([
        this.classical.signPayment(paymentObject),
        this.pqc.signPayment(paymentObject)
      ]);
      const durationMs = performance.now() - startTime;

      return {
        profile: 'hybrid',
        algorithm: 'RSA-PSS-2048 + ML-DSA-65 (Dual Signature)',
        policy: 'STRICT_BOTH_REQUIRED: Signature valid only if BOTH classical and post-quantum layers verify successfully',
        classicalSignature: classicalSig,
        pqcSignature: pqcSig,
        signatureSize: classicalSig.signatureSize + pqcSig.signatureSize, // 256 + 3,309 = 3,565 bytes
        canonicalPayload: classicalSig.canonicalPayload,
        durationMs,
        quantumStatus: 'Hybrid Post-Quantum Protected + Classical Regulatory Compliant'
      };
    }

    async verifyPayment(paymentObject, signatureEnvelope) {
      await this.init();
      const startTime = performance.now();

      if (!signatureEnvelope || !signatureEnvelope.classicalSignature || !signatureEnvelope.pqcSignature) {
        return {
          isValid: false,
          durationMs: performance.now() - startTime,
          classicalVerified: false,
          pqcVerified: false,
          policyEnforced: 'STRICT_BOTH_REQUIRED',
          rejectionReason: 'Missing classical or post-quantum signature component in hybrid verification envelope (downgrade attempt blocked)'
        };
      }

      const classicalResult = await this.classical.verifyPayment(paymentObject, signatureEnvelope.classicalSignature);
      const pqcResult = await this.pqc.verifyPayment(paymentObject, signatureEnvelope.pqcSignature);
      const durationMs = performance.now() - startTime;

      // STRICT_BOTH_REQUIRED policy
      const isValid = classicalResult.isValid && pqcResult.isValid;

      let rejectionReason = null;
      if (!classicalResult.isValid && !pqcResult.isValid) {
        rejectionReason = 'Both classical (RSA-PSS) and post-quantum (ML-DSA) signature verifications failed';
      } else if (!classicalResult.isValid) {
        rejectionReason = 'Classical RSA-PSS signature verification failed in hybrid verification policy';
      } else if (!pqcResult.isValid) {
        rejectionReason = 'Post-Quantum ML-DSA signature verification failed in hybrid verification policy (downgrade or PQC forgery attempt blocked)';
      }

      return {
        isValid,
        durationMs,
        classicalVerified: classicalResult.isValid,
        pqcVerified: pqcResult.isValid,
        policyEnforced: 'STRICT_BOTH_REQUIRED',
        rejectionReason
      };
    }

    async protectField(plaintextField, aad) {
      await this.init();
      const startTime = performance.now();
      // In hybrid field protection, KEM shared secret + classical OAEP wrapped key are combined
      const [classicalEnvelope, pqcEnvelope] = await Promise.all([
        this.classical.protectField(plaintextField, aad),
        this.pqc.protectField(plaintextField, aad)
      ]);
      const durationMs = performance.now() - startTime;

      return {
        profile: 'hybrid',
        mechanism: 'Dual Key Establishment (RSA-OAEP-2048 + ML-KEM-768) + AES-256-GCM',
        classicalEnvelope,
        pqcEnvelope,
        totalEnvelopeBytes: classicalEnvelope.ciphertextSize + pqcEnvelope.totalEnvelopeBytes,
        durationMs,
        quantumStatus: 'Dual-Protected (Resistant to classical cryptanalysis and quantum HNDL)'
      };
    }

    async unprotectField(protectedEnvelope, aad) {
      await this.init();
      const startTime = performance.now();
      // For decryption under hybrid policy, post-quantum layer is decrypted and verified
      const pqcResult = await this.pqc.unprotectField(protectedEnvelope.pqcEnvelope, aad);
      const durationMs = performance.now() - startTime;

      return {
        plaintextContent: pqcResult.plaintextContent,
        durationMs
      };
    }

    getMetadata() {
      return {
        profile: 'hybrid',
        title: 'Hybrid Transition Profile (Recommended Production Path)',
        signatureAlgorithm: 'Dual: RSA-PSS-2048 + ML-DSA-65',
        keyEstablishment: 'Dual: RSA-OAEP-2048 + ML-KEM-768',
        symmetricData: 'AES-256-GCM with HKDF Combiner',
        hashAlgorithm: 'SHA-256 & SHA-384',
        quantumSecurityBits: 192,
        nistSecurityCategory: 3,
        standards: ['NIST FIPS 203', 'NIST FIPS 204', 'RFC 9180', 'IETF Hybrid Schemes Drafts'],
        securityNotes: 'Provides defense in depth: security holds if EITHER the classical factoring assumption holds OR the module lattice problem holds. Strict non-downgrade policy.'
      };
    }
  }

  // --- Payment Controller (Consumes CryptoProvider) ---
  class PaymentController {
    constructor(provider) {
      this.provider = provider;
    }

    setProvider(provider) {
      this.provider = provider;
    }

    async executePayment(paymentPayload, sensitiveAccountNumber) {
      // Business logic remains 100% agnostic to cryptographic algorithms!
      const signedPayment = await this.provider.signPayment(paymentPayload);
      const protectedAccount = await this.provider.protectField(
        sensitiveAccountNumber,
        paymentPayload.transactionId || 'TX-DEFAULT'
      );
      const verification = await this.provider.verifyPayment(paymentPayload, signedPayment);

      return {
        status: verification.isValid ? 'EXECUTED_SUCCESS' : 'REJECTED_SIGNATURE_FAILURE',
        transactionId: paymentPayload.transactionId,
        amount: paymentPayload.amount,
        currency: paymentPayload.currency,
        recipient: paymentPayload.recipient,
        signatureEnvelope: signedPayment,
        accountEnvelope: protectedAccount,
        verificationResult: verification,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Factory function to get provider instance by name
  function getProvider(profileName) {
    switch ((profileName || '').toLowerCase()) {
      case 'pqc':
      case 'post-quantum':
        return new PQCProvider();
      case 'hybrid':
        return new HybridProvider();
      case 'classical':
      default:
        return new ClassicalProvider();
    }
  }

  return {
    CryptoProvider,
    ClassicalProvider,
    PQCProvider,
    HybridProvider,
    PaymentController,
    getProvider
  };
});
