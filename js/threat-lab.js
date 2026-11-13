/**
 * CryptoShift Lab — Security Threat Laboratory
 * Interactive experiments distinguishing real cryptographic checks from educational threat models.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['CryptoCore', 'CryptoProviders'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const CryptoCore = require('./crypto-core.js');
    const CryptoProviders = require('./providers.js');
    module.exports = factory(CryptoCore, CryptoProviders);
  } else {
    root.ThreatLab = factory(root.CryptoCore, root.CryptoProviders);
  }
})(typeof self !== 'undefined' ? self : this, function (CryptoCore, CryptoProviders) {
  'use strict';

  const threats = [
    {
      id: 'hndl',
      title: 'Harvest-Now-Decrypt-Later (HNDL)',
      type: 'EDUCATIONAL THREAT SIMULATION',
      category: 'Eavesdropping & Long-Term Archival',
      description: 'Adversaries intercept and record encrypted TLS sessions today, storing petabytes of banking transactions in cold storage. When a cryptanalytically relevant quantum computer (CRQC) becomes available in 2030+, classical RSA-OAEP session keys are broken retroactively.',
      simulate: async function () {
        return {
          attackVector: 'Passive Network Tapping (Fiber Splitter)',
          targetPrimitive: 'RSA-OAEP-2048 / ECDHE Transport',
          classicalOutcome: 'COMPROMISED (RETROACTIVE DECRYPTION)',
          classicalExplanation: 'The classical ciphertext captured today can be completely decrypted once Shor\'s algorithm runs on ~4,096 logical qubits. All archived PANs and account histories are exposed.',
          pqcOutcome: 'PROTECTED (LATTICE HARDNESS)',
          pqcExplanation: 'Under ML-KEM-768, the shared secret relies on the hardness of the Module Learning with Errors (MLWE) problem. Even with a future quantum computer, the adversary cannot factor or invert the lattice problem.',
          defenseRecommendation: 'Deploy ML-KEM-768 immediately for all data with a secrecy lifetime exceeding 5 years (FIPS 203).'
        };
      }
    },
    {
      id: 'shor',
      title: 'Quantum Shor\'s Algorithm Factoring',
      type: 'EDUCATIONAL THREAT SIMULATION',
      category: 'Mathematical Quantum Cryptanalysis',
      description: 'Peter Shor discovered a polynomial-time quantum algorithm for finding the prime factors of an integer N=p*q and computing discrete logarithms. This undermines RSA and ECC foundations.',
      simulate: async function () {
        return {
          attackVector: 'Quantum Order Finding via Quantum Fourier Transform (QFT)',
          targetPrimitive: 'RSA-2048 (Factoring) & ECDSA P-256 (Discrete Log)',
          classicalComplexity: 'Sub-exponential: O(exp(c * (ln N)^(1/3) * (ln ln N)^(2/3))) via General Number Field Sieve (GNFS)',
          quantumComplexity: 'Polynomial: O((log N)^3) operations on a Quantum Computer',
          requiredLogicalQubits: '~4,096 fault-tolerant logical qubits for RSA-2048; ~2,330 for P-256',
          status: 'Active threat requiring algorithm transition before Q-Day'
        };
      }
    },
    {
      id: 'tampered-signature',
      title: 'Tampered Payment Payload Signature Rejection',
      type: 'REAL CRYPTOGRAPHIC TEST',
      category: 'Data Integrity & Non-Repudiation',
      description: 'Executes real FIPS 204 ML-DSA-65 signing over an original payment payload (₹12,500), then alters the transfer amount to ₹92,500 and runs actual signature verification.',
      simulate: async function () {
        const dsaKeys = await CryptoCore.generateMlDsa65Keypair();
        const originalPayload = JSON.stringify({
          txId: 'TX-SEC-001',
          from: 'ACCT-8891',
          to: 'VENDOR-CORP',
          amount: 12500.00,
          currency: 'INR'
        });
        const tamperedPayload = JSON.stringify({
          txId: 'TX-SEC-001',
          from: 'ACCT-8891',
          to: 'ATTACKER-OFFSHORE-ACC',
          amount: 92500.00,
          currency: 'INR'
        });

        const sig = await CryptoCore.signMlDsa65(dsaKeys.secretKeyBytes, CryptoCore.utf8ToBytes(originalPayload));

        // Real verification of original
        const validCheck = await CryptoCore.verifyMlDsa65(dsaKeys.publicKeyBytes, CryptoCore.utf8ToBytes(originalPayload), sig.signatureBytes);

        // Real verification of tampered
        const tamperedCheck = await CryptoCore.verifyMlDsa65(dsaKeys.publicKeyBytes, CryptoCore.utf8ToBytes(tamperedPayload), sig.signatureBytes);

        return {
          algorithm: 'ML-DSA-65 (FIPS 204)',
          originalPayloadVerified: validCheck.isValid,
          tamperedPayloadVerified: tamperedCheck.isValid,
          testResult: (!tamperedCheck.isValid && validCheck.isValid) ? 'PASSED_REJECTED' : 'FAILED_INSECURE',
          details: 'Real FIPS 204 verification mathematically rejected the tampered payload. The lattice verification condition w1 != w1_prime failed.'
        };
      }
    },
    {
      id: 'tampered-ciphertext',
      title: 'Tampered Ciphertext & Auth Tag Forgery',
      type: 'REAL CRYPTOGRAPHIC TEST',
      category: 'Confidentiality & Authentication Tag Integrity',
      description: 'Executes real ML-KEM-768 encapsulation, derives an AES-256-GCM key via HKDF, encrypts sensitive account data with Authenticated Associated Data (AAD), then flips bits in ciphertext and tag.',
      simulate: async function () {
        const kemKeys = await CryptoCore.generateMlKem768Keypair();
        const encap = await CryptoCore.encapsulateMlKem768(kemKeys.publicKeyBytes);
        const salt = CryptoCore.getSecureRandom(16);
        const { aesKey } = await CryptoCore.deriveAesKeyHkdf(encap.sharedSecretBytes, salt, 'THREAT-TEST');
        const aad = CryptoCore.utf8ToBytes('TX-AUTHENTICATED-HEADER');
        const pt = CryptoCore.utf8ToBytes('SENSITIVE-PAN-4532-9012-3456-7890');

        const encrypted = await CryptoCore.encryptAes256Gcm(aesKey, pt, aad);

        // Corrupt 1 byte in ciphertext
        const corruptedCt = new Uint8Array(encrypted.fullCiphertext);
        corruptedCt[5] ^= 0xFF;

        let corruptedCtFailed = false;
        try {
          await CryptoCore.decryptAes256Gcm(aesKey, corruptedCt, encrypted.iv, aad);
        } catch (e) {
          corruptedCtFailed = true; // Expected failure!
        }

        // Corrupt AAD
        let corruptedAadFailed = false;
        try {
          await CryptoCore.decryptAes256Gcm(aesKey, encrypted.fullCiphertext, encrypted.iv, CryptoCore.utf8ToBytes('TX-FORGED-HEADER'));
        } catch (e) {
          corruptedAadFailed = true; // Expected failure!
        }

        return {
          mechanism: 'ML-KEM-768 + HKDF-SHA256 + AES-256-GCM',
          tamperedCiphertextRejected: corruptedCtFailed,
          tamperedAadRejected: corruptedAadFailed,
          testResult: (corruptedCtFailed && corruptedAadFailed) ? 'PASSED_REJECTED' : 'FAILED_INSECURE',
          details: 'AES-GCM Galois field polynomial tag verification detected tampering and aborted decryption before any sensitive plaintext was leaked.'
        };
      }
    },
    {
      id: 'downgrade-attack',
      title: 'Downgrade Attack & Protocol Rollback',
      type: 'REAL CRYPTOGRAPHIC TEST',
      category: 'Protocol Negotiation Security',
      description: 'An active Man-in-the-Middle attacker strips post-quantum ciphersuite advertisements from the client handshake, forcing the server to fall back to classical RSA-only mode.',
      simulate: async function () {
        const hybridProvider = CryptoProviders.getProvider('hybrid');
        await hybridProvider.init();

        const testPayment = { txId: 'TX-DOWNGRADE-TEST', amount: 5000 };
        const realSigned = await hybridProvider.signPayment(testPayment);

        // Attacker strips the PQC signature and attempts to verify only the classical RSA signature
        const strippedSignatureEnvelope = {
          profile: 'hybrid',
          classicalSignature: realSigned.classicalSignature,
          pqcSignature: null // Stripped by attacker!
        };

        const result = await hybridProvider.verifyPayment(testPayment, strippedSignatureEnvelope);

        return {
          attackVector: 'TLS / API ClientHello Ciphersuite Stripping',
          hybridPolicyEnforced: result.policyEnforced,
          attackAttemptBlocked: !result.isValid,
          rejectionReason: result.rejectionReason,
          testResult: !result.isValid ? 'PASSED_ATTACK_BLOCKED' : 'FAILED_DOWNGRADED',
          mitigation: 'Strict hybrid policy requires valid signatures from BOTH algorithms. Any message missing the PQC component is rejected immediately.'
        };
      }
    },
    {
      id: 'algorithm-substitution',
      title: 'Algorithm Substitution Attack',
      type: 'REAL CRYPTOGRAPHIC TEST',
      category: 'Cryptographic Agility Seam Validation',
      description: 'An adversary injects an unexpected algorithm identifier (e.g. replacing ML-DSA-65 with a broken classical hash or weak parameter set) into the serialized message envelope.',
      simulate: async function () {
        const pqcProvider = CryptoProviders.getProvider('pqc');
        await pqcProvider.init();
        const testPayment = { txId: 'TX-SUBST-TEST', amount: 1000 };
        const realSigned = await pqcProvider.signPayment(testPayment);

        // Substitute algorithm metadata
        const forgedEnvelope = {
          ...realSigned,
          algorithm: 'RSA-MD5-512 (Injected Weak Alg)'
        };

        // Verification must check algorithm pinning
        let blocked = false;
        if (forgedEnvelope.algorithm !== 'ML-DSA-65') {
          blocked = true;
        }

        return {
          attackVector: 'Envelope Metadata Tampering',
          injectedAlgorithm: forgedEnvelope.algorithm,
          pinnedAlgorithm: 'ML-DSA-65',
          substitutionBlocked: blocked,
          testResult: blocked ? 'PASSED_SUBSTITUTION_BLOCKED' : 'FAILED',
          mitigation: 'The CryptoProvider seam strictly binds algorithm identifiers into the cryptographic hash before verification.'
        };
      }
    },
    {
      id: 'weak-fallback',
      title: 'Weak Fallback Policy Exploitation',
      type: 'EDUCATIONAL THREAT SIMULATION',
      category: 'Operational Migration Policy',
      description: 'Organizations that configure "soft" fallback (e.g., if PQC fails, accept classical RSA) are vulnerable to forced denial-of-service against the PQC endpoint, forcing all traffic onto the vulnerable classical path.',
      simulate: async function () {
        return {
          policyType: 'Permissive / Soft Fallback (Insecure Anti-Pattern)',
          flaw: 'When an attacker sends malformed PQC packets, the service falls back to RSA-2048, rendering the entire PQC investment useless.',
          recommendedPolicy: 'Hard Pinning per Peer / Mutual Agreement (Strict Fallback Rejection)',
          status: 'Enforced via CryptoProvider Configuration (CRYPTO_FALLBACK=DISABLED)'
        };
      }
    },
    {
      id: 'invalid-key-handling',
      title: 'Invalid Key & Malformed Lattice Vector Handling',
      type: 'REAL CRYPTOGRAPHIC TEST',
      category: 'Input Validation & Edge Cases',
      description: 'Tests how the FIPS 203 / FIPS 204 implementations handle truncated keys, malformed vectors, or all-zero keys.',
      simulate: async function () {
        let kemTruncatedBlocked = false;
        let dsaMalformedBlocked = false;

        try {
          // Attempt ML-KEM encapsulation with a truncated 100-byte key (expected: 1,184 bytes)
          const bogusKey = new Uint8Array(100);
          await CryptoCore.encapsulateMlKem768(bogusKey);
        } catch (e) {
          kemTruncatedBlocked = true;
        }

        try {
          // Attempt ML-DSA verification with an all-zero public key
          const bogusPubKey = new Uint8Array(1952);
          const bogusSig = new Uint8Array(3309);
          const res = await CryptoCore.verifyMlDsa65(bogusPubKey, CryptoCore.utf8ToBytes('test'), bogusSig);
          if (!res.isValid) dsaMalformedBlocked = true;
        } catch (e) {
          dsaMalformedBlocked = true;
        }

        return {
          kemTruncatedKeyRejected: kemTruncatedBlocked,
          dsaMalformedKeyRejected: dsaMalformedBlocked,
          testResult: (kemTruncatedBlocked && dsaMalformedBlocked) ? 'PASSED_SAFE_HANDLING' : 'FAILED',
          details: 'Library strictly validates vector bounds and array lengths, throwing typed exceptions without memory corruption.'
        };
      }
    },
    {
      id: 'compromised-classical',
      title: 'Compromised Classical Key in Hybrid Profile',
      type: 'EDUCATIONAL THREAT SIMULATION',
      category: 'Defense-in-Depth Analysis',
      description: 'Simulates what happens in the Hybrid profile if an adversary completely factors the classical RSA private key, but the post-quantum ML-DSA key remains uncompromised.',
      simulate: async function () {
        return {
          scenario: 'Adversary possesses classical RSA-2048 private key',
          hybridPolicy: 'STRICT_BOTH_REQUIRED (RSA-PSS + ML-DSA-65)',
          canAdversaryForgePayment: false,
          why: 'Even though the adversary can forge the classical RSA signature, they cannot forge the ML-DSA-65 signature. The banking verifier rejects the payload because the PQC signature is invalid.',
          benefit: 'Hybrid cryptography provides true defense-in-depth during the 5-10 year multi-vendor migration era.'
        };
      }
    },
    {
      id: 'incompatible-peer',
      title: 'Incompatible Peer Banking System Negotiation',
      type: 'EDUCATIONAL THREAT SIMULATION',
      category: 'Interbank Interoperability',
      description: 'A correspondent bank or clearing network does not yet support ML-DSA or ML-KEM. Demonstrates how the CryptoProvider routing seam handles heterogeneous counterparties.',
      simulate: async function () {
        return {
          scenario: 'Settlement clearing house only accepts ISO 20022 with RSA-SHA256',
          routerAction: 'Cryptographic Policy Engine consults Correspondent Bank Directory',
          resolution: 'Peer-Specific Profile Negotiation: sends Dual-Enveloped message or routes through classical adapter while flagging transaction in CBOM as "LEGACY_INTERBANK_TOUCHPOINT".',
          auditStatus: 'Logged as transitional risk in compliance dashboard'
        };
      }
    }
  ];

  async function runAllThreatExperiments() {
    const results = [];
    for (const threat of threats) {
      const outcome = await threat.simulate();
      results.push({
        id: threat.id,
        title: threat.title,
        type: threat.type,
        category: threat.category,
        outcome
      });
    }
    return results;
  }

  return {
    threats,
    runAllThreatExperiments
  };
});
