/**
 * CryptoShift Lab — Performance & Infrastructure Benchmark Suite
 * Executes real in-environment cryptographic operations and measures exact wall-clock
 * durations, memory/size characteristics, and client hardware metadata.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['CryptoCore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const CryptoCore = require('./crypto-core.js');
    module.exports = factory(CryptoCore);
  } else {
    root.Benchmarks = factory(root.CryptoCore);
  }
})(typeof self !== 'undefined' ? self : this, function (CryptoCore) {
  'use strict';

  function getClientEnvironment() {
    const isBrowser = typeof window !== 'undefined';
    const nav = isBrowser ? window.navigator : null;

    let memoryInfo = 'N/A';
    if (nav && window.performance && window.performance.memory) {
      const mem = window.performance.memory;
      memoryInfo = `${(mem.usedJSHeapSize / (1024 * 1024)).toFixed(1)} MB used / ${(mem.jsHeapSizeLimit / (1024 * 1024)).toFixed(0)} MB limit`;
    } else if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      memoryInfo = `${(mem.heapUsed / (1024 * 1024)).toFixed(1)} MB heap used`;
    }

    return {
      platform: nav ? (nav.userAgentData ? nav.userAgentData.platform : nav.platform || 'Browser') : (process.platform || 'Node.js'),
      userAgent: nav ? nav.userAgent : `Node.js ${process.version}`,
      logicalCores: nav ? (nav.hardwareConcurrency || 'Undisclosed') : (require('os').cpus().length || 'Unknown'),
      memoryStatus: memoryInfo,
      webCryptoAvailable: typeof crypto !== 'undefined' && !!crypto.subtle,
      timingResolution: 'performance.now() (~5 microseconds precision)'
    };
  }

  async function runSingleBenchmark(iterations = 3) {
    const env = getClientEnvironment();
    const testPaymentPayload = CryptoCore.utf8ToBytes(JSON.stringify({
      transactionId: 'TX-BENCHMARK-9901',
      from: 'ACCT-8891-2291',
      to: 'SETTLEMENT-CLEARING-HOUSE',
      amount: 50000.00,
      currency: 'INR',
      timestamp: Date.now()
    }));
    const testField = 'PAN: 4111-2222-3333-4444 | CVV: 891 | EXP: 12/29';

    const results = {
      timestamp: new Date().toISOString(),
      iterations,
      environment: env,
      classical: {},
      pqc: {},
      hybrid: {}
    };

    // 1. Benchmark Classical: RSA-PSS-2048 & RSA-OAEP-2048
    let rsaKeygenTotal = 0;
    let rsaSignTotal = 0;
    let rsaVerifyTotal = 0;
    let rsaOaepKeygenTotal = 0;
    let rsaEncryptTotal = 0;
    let rsaDecryptTotal = 0;

    let lastRsaPssPair = null;
    let lastRsaSig = null;
    let lastRsaOaepPair = null;
    let lastRsaCt = null;

    for (let i = 0; i < iterations; i++) {
      // RSA-PSS
      const t0 = performance.now();
      const pssPair = await CryptoCore.generateRsaPssKeypair();
      rsaKeygenTotal += (performance.now() - t0);
      lastRsaPssPair = pssPair;

      const sigRes = await CryptoCore.signRsaPss(pssPair.keyPair.privateKey, testPaymentPayload);
      rsaSignTotal += sigRes.durationMs;
      lastRsaSig = sigRes;

      const verRes = await CryptoCore.verifyRsaPss(pssPair.keyPair.publicKey, testPaymentPayload, sigRes.signatureBytes);
      rsaVerifyTotal += verRes.durationMs;

      // RSA-OAEP
      const t1 = performance.now();
      const oaepPair = await CryptoCore.generateRsaOaepKeypair();
      rsaOaepKeygenTotal += (performance.now() - t1);
      lastRsaOaepPair = oaepPair;

      const encRes = await CryptoCore.encryptRsaOaep(oaepPair.keyPair.publicKey, CryptoCore.utf8ToBytes(testField));
      rsaEncryptTotal += encRes.durationMs;
      lastRsaCt = encRes;

      const decRes = await CryptoCore.decryptRsaOaep(oaepPair.keyPair.privateKey, encRes.ciphertextBytes);
      rsaDecryptTotal += decRes.durationMs;
    }

    results.classical = {
      label: 'Classical (RSA-2048)',
      signature: {
        algorithm: 'RSA-PSS-2048',
        keygenMs: +(rsaKeygenTotal / iterations).toFixed(2),
        signMs: +(rsaSignTotal / iterations).toFixed(2),
        verifyMs: +(rsaVerifyTotal / iterations).toFixed(2),
        publicKeyBytes: lastRsaPssPair.publicKeyBytes, // ~294 bytes SPKI
        privateKeyBytes: lastRsaPssPair.privateKeyBytes, // ~1192 bytes PKCS#8
        signatureBytes: lastRsaSig.sizeBytes // 256 bytes
      },
      encryption: {
        algorithm: 'RSA-OAEP-2048',
        keygenMs: +(rsaOaepKeygenTotal / iterations).toFixed(2),
        encryptMs: +(rsaEncryptTotal / iterations).toFixed(2),
        decryptMs: +(rsaDecryptTotal / iterations).toFixed(2),
        ciphertextBytes: lastRsaCt.sizeBytes // 256 bytes
      },
      totalTxProcessingMs: +((rsaSignTotal + rsaVerifyTotal + rsaEncryptTotal + rsaDecryptTotal) / iterations).toFixed(2)
    };

    // 2. Benchmark Post-Quantum: ML-DSA-65 & ML-KEM-768 + AES-256-GCM
    let dsaKeygenTotal = 0;
    let dsaSignTotal = 0;
    let dsaVerifyTotal = 0;
    let kemKeygenTotal = 0;
    let kemEncapTotal = 0;
    let kemDecapTotal = 0;
    let aesEncryptTotal = 0;
    let aesDecryptTotal = 0;

    let lastDsaPair = null;
    let lastDsaSig = null;
    let lastKemPair = null;
    let lastKemEncap = null;
    let lastAesEnc = null;

    for (let i = 0; i < iterations; i++) {
      // ML-DSA-65
      const dsaPair = await CryptoCore.generateMlDsa65Keypair();
      dsaKeygenTotal += dsaPair.durationMs;
      lastDsaPair = dsaPair;

      const dsaSig = await CryptoCore.signMlDsa65(dsaPair.secretKeyBytes, testPaymentPayload);
      dsaSignTotal += dsaSig.durationMs;
      lastDsaSig = dsaSig;

      const dsaVer = await CryptoCore.verifyMlDsa65(dsaPair.publicKeyBytes, testPaymentPayload, dsaSig.signatureBytes);
      dsaVerifyTotal += dsaVer.durationMs;

      // ML-KEM-768
      const kemPair = await CryptoCore.generateMlKem768Keypair();
      kemKeygenTotal += kemPair.durationMs;
      lastKemPair = kemPair;

      const encap = await CryptoCore.encapsulateMlKem768(kemPair.publicKeyBytes);
      kemEncapTotal += encap.durationMs;
      lastKemEncap = encap;

      const decap = await CryptoCore.decapsulateMlKem768(encap.ciphertextBytes, kemPair.secretKeyBytes);
      kemDecapTotal += decap.durationMs;

      // HKDF + AES-256-GCM
      const salt = CryptoCore.getSecureRandom(16);
      const { aesKey } = await CryptoCore.deriveAesKeyHkdf(encap.sharedSecretBytes, salt, 'BENCH-PQC');
      const encAes = await CryptoCore.encryptAes256Gcm(aesKey, CryptoCore.utf8ToBytes(testField), CryptoCore.utf8ToBytes('TX-AAD'));
      aesEncryptTotal += encAes.durationMs;
      lastAesEnc = encAes;

      const decAes = await CryptoCore.decryptAes256Gcm(aesKey, encAes.fullCiphertext, encAes.iv, CryptoCore.utf8ToBytes('TX-AAD'));
      aesDecryptTotal += decAes.durationMs;
    }

    results.pqc = {
      label: 'Post-Quantum (ML-DSA-65 & ML-KEM-768)',
      signature: {
        algorithm: 'ML-DSA-65 (FIPS 204)',
        keygenMs: +(dsaKeygenTotal / iterations).toFixed(2),
        signMs: +(dsaSignTotal / iterations).toFixed(2),
        verifyMs: +(dsaVerifyTotal / iterations).toFixed(2),
        publicKeyBytes: lastDsaPair.publicKeySize, // 1,952 bytes
        privateKeyBytes: lastDsaPair.secretKeySize, // 4,032 bytes
        signatureBytes: lastDsaSig.sizeBytes // 3,309 bytes
      },
      encryption: {
        algorithm: 'ML-KEM-768 + AES-256-GCM (FIPS 203 + SP 800-38D)',
        keygenMs: +(kemKeygenTotal / iterations).toFixed(2),
        encapMs: +(kemEncapTotal / iterations).toFixed(2),
        decapMs: +(kemDecapTotal / iterations).toFixed(2),
        aesEncryptMs: +(aesEncryptTotal / iterations).toFixed(2),
        aesDecryptMs: +(aesDecryptTotal / iterations).toFixed(2),
        publicKeyBytes: lastKemPair.publicKeySize, // 1,184 bytes
        secretKeyBytes: lastKemPair.secretKeySize, // 2,400 bytes
        kemCiphertextBytes: lastKemEncap.ciphertextSize, // 1,088 bytes
        aesCiphertextBytes: lastAesEnc.totalSizeBytes // payload + 16-byte tag
      },
      totalTxProcessingMs: +((dsaSignTotal + dsaVerifyTotal + kemEncapTotal + kemDecapTotal + aesEncryptTotal + aesDecryptTotal) / iterations).toFixed(2)
    };

    // 3. Hybrid Summary
    results.hybrid = {
      label: 'Hybrid Transition (Dual Classical + PQC)',
      signature: {
        algorithm: 'RSA-PSS-2048 + ML-DSA-65',
        signMs: +(results.classical.signature.signMs + results.pqc.signature.signMs).toFixed(2),
        verifyMs: +(results.classical.signature.verifyMs + results.pqc.signature.verifyMs).toFixed(2),
        totalSignatureBytes: results.classical.signature.signatureBytes + results.pqc.signature.signatureBytes // 256 + 3309 = 3565 bytes
      },
      encryption: {
        algorithm: 'RSA-OAEP-2048 + ML-KEM-768 / AES-256-GCM',
        establishMs: +(results.classical.encryption.encryptMs + results.pqc.encryption.encapMs).toFixed(2),
        totalEnvelopeBytes: results.classical.encryption.ciphertextBytes + results.pqc.encryption.kemCiphertextBytes + results.pqc.encryption.aesCiphertextBytes
      },
      totalTxProcessingMs: +(results.classical.totalTxProcessingMs + results.pqc.totalTxProcessingMs).toFixed(2)
    };

    // Ratios & Size Expansion
    results.comparisons = {
      signatureSizeExpansionRatio: +(results.pqc.signature.signatureBytes / results.classical.signature.signatureBytes).toFixed(1), // 12.9x
      publicKeySizeExpansionRatio: +(results.pqc.signature.publicKeyBytes / results.classical.signature.publicKeyBytes).toFixed(1), // ~6.6x
      encryptionCiphertextExpansionRatio: +(results.pqc.encryption.kemCiphertextBytes / results.classical.encryption.ciphertextBytes).toFixed(1), // 4.25x
      throughputEstimatePerSecond: Math.floor(1000 / (results.pqc.totalTxProcessingMs || 1))
    };

    return results;
  }

  return {
    getClientEnvironment,
    runSingleBenchmark
  };
});
