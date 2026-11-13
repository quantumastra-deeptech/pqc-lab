/**
 * CryptoShift Lab — Core Cryptographic Engine
 * Combines W3C Web Cryptography API with FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA)
 * from the audited @noble/post-quantum suite.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['noblePqc'], factory);
  } else if (typeof module === 'object' && module.exports) {
    try {
      require('./lib/noble-pqc.bundle.js');
    } catch (e) {
      try {
        require('../js/lib/noble-pqc.bundle.js');
      } catch (e2) {}
    }
    module.exports = factory(globalThis.noblePqc);
  } else {
    root.CryptoCore = factory(root.noblePqc);
  }
})(typeof self !== 'undefined' ? self : this, function (noblePqc) {
  'use strict';

  const subtle = (typeof crypto !== 'undefined' && crypto.subtle)
    ? crypto.subtle
    : (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle);

  if (!subtle) {
    console.warn('[CryptoCore] Web Cryptography API (crypto.subtle) is not available in this environment.');
  }

  // Helper: Uint8Array <-> Hex string
  function bytesToHex(bytes) {
    if (!bytes) return '';
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    if (!hex) return new Uint8Array(0);
    const cleanHex = hex.replace(/\s+/g, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function utf8ToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function bytesToUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  }

  function getSecureRandom(byteLength) {
    const arr = new Uint8Array(byteLength);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(arr);
    } else {
      throw new Error('Secure cryptographic randomness not available');
    }
    return arr;
  }

  // --- Classical Signatures: RSA-PSS-2048 with SHA-256 ---
  async function generateRsaPssKeypair() {
    const keyPair = await subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256'
      },
      true,
      ['sign', 'verify']
    );
    const spki = await subtle.exportKey('spki', keyPair.publicKey);
    return {
      keyPair,
      publicKeySpki: new Uint8Array(spki),
      publicKeyHex: bytesToHex(new Uint8Array(spki)),
      algorithm: 'RSA-PSS-2048',
      keySizeBits: 2048,
      publicKeyBytes: spki.byteLength,
      privateKeyBytes: 1192 // typical 2048-bit PKCS#8 DER size
    };
  }

  async function signRsaPss(privateKey, dataBytes) {
    const startTime = performance.now();
    const signature = await subtle.sign(
      { name: 'RSA-PSS', saltLength: 32 },
      privateKey,
      dataBytes
    );
    const durationMs = performance.now() - startTime;
    const sigBytes = new Uint8Array(signature);
    return {
      signatureBytes: sigBytes,
      signatureHex: bytesToHex(sigBytes),
      sizeBytes: sigBytes.length,
      durationMs
    };
  }

  async function verifyRsaPss(publicKey, dataBytes, signatureBytes) {
    const startTime = performance.now();
    const isValid = await subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      publicKey,
      signatureBytes,
      dataBytes
    );
    const durationMs = performance.now() - startTime;
    return { isValid, durationMs };
  }

  // --- Post-Quantum Signatures: ML-DSA-65 (FIPS 204) ---
  function getMlDsaInstance() {
    const pqc = noblePqc || (typeof window !== 'undefined' ? window.noblePqc : (typeof globalThis !== 'undefined' ? globalThis.noblePqc : null));
    if (!pqc || !pqc.ml_dsa65) {
      throw new Error('FIPS 204 ML-DSA-65 library is not loaded');
    }
    return pqc.ml_dsa65;
  }

  async function generateMlDsa65Keypair() {
    const mlDsa = getMlDsaInstance();
    const startTime = performance.now();
    const keys = mlDsa.keygen();
    const durationMs = performance.now() - startTime;
    return {
      publicKeyBytes: keys.publicKey,
      secretKeyBytes: keys.secretKey,
      publicKeyHex: bytesToHex(keys.publicKey),
      algorithm: 'ML-DSA-65 (FIPS 204)',
      publicKeySize: keys.publicKey.length, // 1,952 bytes
      secretKeySize: keys.secretKey.length, // 4,032 bytes
      durationMs
    };
  }

  async function signMlDsa65(secretKeyBytes, dataBytes) {
    const mlDsa = getMlDsaInstance();
    const startTime = performance.now();
    // In noble-pqc ml-dsa: sign(msg, secretKey)
    const signature = mlDsa.sign(dataBytes, secretKeyBytes);
    const durationMs = performance.now() - startTime;
    return {
      signatureBytes: signature,
      signatureHex: bytesToHex(signature),
      sizeBytes: signature.length, // 3,309 bytes
      durationMs
    };
  }

  async function verifyMlDsa65(publicKeyBytes, dataBytes, signatureBytes) {
    const mlDsa = getMlDsaInstance();
    const startTime = performance.now();
    let isValid = false;
    try {
      // In noble-pqc ml-dsa: verify(sig, msg, publicKey)
      isValid = mlDsa.verify(signatureBytes, dataBytes, publicKeyBytes);
    } catch (e) {
      isValid = false;
    }
    const durationMs = performance.now() - startTime;
    return { isValid, durationMs };
  }

  // --- Classical Encryption: RSA-OAEP-2048 ---
  async function generateRsaOaepKeypair() {
    const keyPair = await subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
    const spki = await subtle.exportKey('spki', keyPair.publicKey);
    return {
      keyPair,
      publicKeySpki: new Uint8Array(spki),
      publicKeyHex: bytesToHex(new Uint8Array(spki)),
      algorithm: 'RSA-OAEP-2048',
      keySizeBits: 2048,
      publicKeyBytes: spki.byteLength,
      privateKeyBytes: 1192
    };
  }

  async function encryptRsaOaep(publicKey, plaintextBytes) {
    const startTime = performance.now();
    const ciphertext = await subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      plaintextBytes
    );
    const durationMs = performance.now() - startTime;
    const ctBytes = new Uint8Array(ciphertext);
    return {
      ciphertextBytes: ctBytes,
      ciphertextHex: bytesToHex(ctBytes),
      sizeBytes: ctBytes.length, // 256 bytes
      durationMs
    };
  }

  async function decryptRsaOaep(privateKey, ciphertextBytes) {
    const startTime = performance.now();
    const plaintext = await subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      ciphertextBytes
    );
    const durationMs = performance.now() - startTime;
    return {
      plaintextBytes: new Uint8Array(plaintext),
      plaintextContent: bytesToUtf8(new Uint8Array(plaintext)),
      durationMs
    };
  }

  // --- Post-Quantum Key Encapsulation: ML-KEM-768 (FIPS 203) ---
  function getMlKemInstance() {
    const pqc = noblePqc || (typeof window !== 'undefined' ? window.noblePqc : (typeof globalThis !== 'undefined' ? globalThis.noblePqc : null));
    if (!pqc || !pqc.ml_kem768) {
      throw new Error('FIPS 203 ML-KEM-768 library is not loaded');
    }
    return pqc.ml_kem768;
  }

  async function generateMlKem768Keypair() {
    const mlKem = getMlKemInstance();
    const startTime = performance.now();
    const keys = mlKem.keygen();
    const durationMs = performance.now() - startTime;
    return {
      publicKeyBytes: keys.publicKey,
      secretKeyBytes: keys.secretKey,
      publicKeyHex: bytesToHex(keys.publicKey),
      algorithm: 'ML-KEM-768 (FIPS 203)',
      publicKeySize: keys.publicKey.length, // 1,184 bytes
      secretKeySize: keys.secretKey.length, // 2,400 bytes
      durationMs
    };
  }

  async function encapsulateMlKem768(publicKeyBytes) {
    const mlKem = getMlKemInstance();
    const startTime = performance.now();
    const { cipherText, sharedSecret } = mlKem.encapsulate(publicKeyBytes);
    const durationMs = performance.now() - startTime;
    return {
      ciphertextBytes: cipherText,
      sharedSecretBytes: sharedSecret,
      ciphertextHex: bytesToHex(cipherText),
      sharedSecretHex: bytesToHex(sharedSecret),
      ciphertextSize: cipherText.length, // 1,088 bytes
      sharedSecretSize: sharedSecret.length, // 32 bytes
      durationMs
    };
  }

  async function decapsulateMlKem768(ciphertextBytes, secretKeyBytes) {
    const mlKem = getMlKemInstance();
    const startTime = performance.now();
    const sharedSecret = mlKem.decapsulate(ciphertextBytes, secretKeyBytes);
    const durationMs = performance.now() - startTime;
    return {
      sharedSecretBytes: sharedSecret,
      sharedSecretHex: bytesToHex(sharedSecret),
      sharedSecretSize: sharedSecret.length, // 32 bytes
      durationMs
    };
  }

  // --- Key Derivation (HKDF-SHA-256) & AES-256-GCM ---
  async function deriveAesKeyHkdf(sharedSecretBytes, saltBytes, infoString) {
    const infoBytes = utf8ToBytes(infoString || 'CryptoShift-Banking-Field-v1');
    const salt = saltBytes || new Uint8Array(16); // 128-bit salt

    const keyMaterial = await subtle.importKey(
      'raw',
      sharedSecretBytes,
      'HKDF',
      false,
      ['deriveKey']
    );

    const aesKey = await subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: infoBytes
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return { aesKey, salt };
  }

  async function encryptAes256Gcm(aesKey, plaintextBytes, aadBytes) {
    // 96-bit unique IV (12 bytes) — NEVER REUSED
    const iv = getSecureRandom(12);
    const aad = aadBytes || new Uint8Array(0);

    const startTime = performance.now();
    const encryptedBuffer = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: aad,
        tagLength: 128
      },
      aesKey,
      plaintextBytes
    );
    const durationMs = performance.now() - startTime;

    const fullCiphertext = new Uint8Array(encryptedBuffer);
    // In Web Crypto AES-GCM, the last 16 bytes are the authentication tag
    const ctPayload = fullCiphertext.slice(0, fullCiphertext.length - 16);
    const authTag = fullCiphertext.slice(fullCiphertext.length - 16);

    return {
      fullCiphertext,
      ciphertextPayload: ctPayload,
      authTag,
      iv,
      ivHex: bytesToHex(iv),
      authTagHex: bytesToHex(authTag),
      ciphertextHex: bytesToHex(ctPayload),
      totalSizeBytes: fullCiphertext.length,
      durationMs
    };
  }

  async function decryptAes256Gcm(aesKey, fullCiphertextBytes, ivBytes, aadBytes) {
    const aad = aadBytes || new Uint8Array(0);
    const startTime = performance.now();
    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        additionalData: aad,
        tagLength: 128
      },
      aesKey,
      fullCiphertextBytes
    );
    const durationMs = performance.now() - startTime;
    const ptBytes = new Uint8Array(decryptedBuffer);

    return {
      plaintextBytes: ptBytes,
      plaintextContent: bytesToUtf8(ptBytes),
      durationMs
    };
  }

  // --- Complete PQC Field Protection Flow ---
  // ML-KEM-768 Key Encapsulation -> HKDF-SHA256 -> AES-256-GCM
  async function protectFieldPqc(recipientPublicKey, fieldData, aadString) {
    const encap = await encapsulateMlKem768(recipientPublicKey);
    const salt = getSecureRandom(16);
    const { aesKey } = await deriveAesKeyHkdf(encap.sharedSecretBytes, salt, 'CryptoShift-PQC-Field-v1');
    const aad = utf8ToBytes(aadString || 'PAYMENT-TX-V1');
    const pt = utf8ToBytes(fieldData);
    const encrypted = await encryptAes256Gcm(aesKey, pt, aad);

    return {
      kemCiphertextBytes: encap.ciphertextBytes,
      kemCiphertextHex: encap.ciphertextHex,
      kemSharedSecretHex: encap.sharedSecretHex,
      aesCiphertextBytes: encrypted.ciphertextPayload,
      aesCiphertextHex: encrypted.ciphertextHex,
      fullEncryptedBuffer: encrypted.fullCiphertext,
      ivHex: encrypted.ivHex,
      ivBytes: encrypted.iv,
      authTagHex: encrypted.authTagHex,
      authTagBytes: encrypted.authTag,
      saltBytes: salt,
      saltHex: bytesToHex(salt),
      totalEnvelopeBytes: encap.ciphertextBytes.length + encrypted.fullCiphertext.length + salt.length + encrypted.iv.length,
      encapsulationDurationMs: encap.durationMs,
      encryptionDurationMs: encrypted.durationMs
    };
  }

  async function unprotectFieldPqc(recipientSecretKey, envelope, aadString) {
    const decaps = await decapsulateMlKem768(envelope.kemCiphertextBytes, recipientSecretKey);
    const { aesKey } = await deriveAesKeyHkdf(decaps.sharedSecretBytes, envelope.saltBytes, 'CryptoShift-PQC-Field-v1');
    const aad = utf8ToBytes(aadString || 'PAYMENT-TX-V1');
    const decrypted = await decryptAes256Gcm(aesKey, envelope.fullEncryptedBuffer, envelope.ivBytes, aad);

    return {
      plaintextContent: decrypted.plaintextContent,
      sharedSecretHex: decaps.sharedSecretHex,
      decapsulationDurationMs: decaps.durationMs,
      decryptionDurationMs: decrypted.durationMs
    };
  }

  // --- Hybrid Combiners ---
  // Dual Signatures: Both RSA-PSS and ML-DSA-65 must verify.
  // Dual KEM/Key Establishment: Concatenate shared secrets using HKDF combiner.
  async function combineSharedSecrets(classicalSecretBytes, pqcSecretBytes) {
    const combined = new Uint8Array(classicalSecretBytes.length + pqcSecretBytes.length);
    combined.set(classicalSecretBytes, 0);
    combined.set(pqcSecretBytes, classicalSecretBytes.length);

    // HKDF extracts a single strong 256-bit symmetric key from both secrets
    const salt = utf8ToBytes('CryptoShift-Hybrid-KEM-Combiner-v1');
    const keyMaterial = await subtle.importKey('raw', combined, 'HKDF', false, ['deriveKey']);
    const derivedKey = await subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: utf8ToBytes('Hybrid-Dual-KEM-AES256')
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    return { combinedKey: derivedKey, combinedInputLength: combined.length };
  }

  return {
    bytesToHex,
    hexToBytes,
    utf8ToBytes,
    bytesToUtf8,
    getSecureRandom,

    // Classical RSA
    generateRsaPssKeypair,
    signRsaPss,
    verifyRsaPss,
    generateRsaOaepKeypair,
    encryptRsaOaep,
    decryptRsaOaep,

    // Post-Quantum ML-DSA & ML-KEM
    generateMlDsa65Keypair,
    signMlDsa65,
    verifyMlDsa65,
    generateMlKem768Keypair,
    encapsulateMlKem768,
    decapsulateMlKem768,

    // Symmetric & KDF
    deriveAesKeyHkdf,
    encryptAes256Gcm,
    decryptAes256Gcm,

    // High-level flows
    protectFieldPqc,
    unprotectFieldPqc,
    combineSharedSecrets
  };
});
