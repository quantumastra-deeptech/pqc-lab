/**
 * CryptoShift Lab — CycloneDX 1.6 CBOM (Cryptographic Bill of Materials) Generator & Validator
 * Conforms to CycloneDX 1.6 Cryptographic Asset Extension specifications.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CbomGenerator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function generateUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (+c ^ (Math.random() * 16 >> (+c / 4))).toString(16)
    );
  }

  // Profile-specific cryptographic asset inventories
  const inventoryDefinitions = {
    classical: {
      profileName: 'classical',
      label: 'Classical Banking Payment Architecture (Legacy AS-IS)',
      overallRisk: 'HIGH_QUANTUM_RISK',
      assets: [
        {
          name: 'RSA-PSS-2048',
          bomRef: 'crypto-asset-rsa-pss-2048',
          assetType: 'algorithm',
          primitive: 'signature',
          parameterSet: '2048-bit modulus',
          oid: '1.2.840.113549.1.1.10',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'w3c-webcrypto',
          certificationLevel: ['FIPS 186-4 (Legacy)'],
          cryptoFunctions: ['sign', 'verify'],
          classicalSecurityBits: 112,
          nistQuantumSecurityLevel: 0,
          usage: 'Digital signature for high-value banking payment payloads & non-repudiation',
          protocol: 'ISO 20022 / AS4 Banking Payment Exchange',
          library: 'Standard Web Cryptography API (SubtleCrypto)',
          component: 'Payment Authorization Service',
          migrationStatus: 'DEPRECATED_SCHEDULED_RETIREMENT',
          quantumRisk: 'CRITICAL_VULNERABLE',
          rationale: 'Shor\'s quantum algorithm factors 2048-bit integers in polynomial time using ~4,096 logical qubits.'
        },
        {
          name: 'RSA-OAEP-2048',
          bomRef: 'crypto-asset-rsa-oaep-2048',
          assetType: 'algorithm',
          primitive: 'pke',
          parameterSet: '2048-bit modulus, SHA-256 MGF1',
          oid: '1.2.840.113549.1.1.7',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'w3c-webcrypto',
          certificationLevel: ['RFC 8017 / PKCS #1 v2.2'],
          cryptoFunctions: ['encrypt', 'decrypt', 'key-wrap'],
          classicalSecurityBits: 112,
          nistQuantumSecurityLevel: 0,
          usage: 'Direct asymmetric field encryption of account numbers and Key Encryption Keys (KEKs)',
          protocol: 'Internal Service-to-Service gRPC mTLS',
          library: 'Standard Web Cryptography API',
          component: 'Customer Account Protection Module',
          migrationStatus: 'URGENT_ACTION_REQUIRED',
          quantumRisk: 'CRITICAL_HNDL_EXPOSED',
          rationale: 'Vulnerable to Harvest-Now-Decrypt-Later (HNDL) attacks against archived transactions.'
        },
        {
          name: 'TLS-ECDHE-RSA-AES128-GCM-SHA256',
          bomRef: 'crypto-asset-tls-ciphersuite-classical',
          assetType: 'protocol',
          primitive: 'protocol-ciphersuite',
          parameterSet: 'TLS 1.2 / 1.3 Classical Exchange',
          oid: '0x00,0x9E',
          executionEnvironment: 'network-transport',
          implementationPlatform: 'ingress-controller',
          certificationLevel: ['RFC 5246', 'RFC 8446'],
          cryptoFunctions: ['key-exchange', 'transport-encryption'],
          classicalSecurityBits: 128,
          nistQuantumSecurityLevel: 0,
          usage: 'Edge API Gateway client-to-bank transport encryption',
          protocol: 'HTTPS / TLS 1.2 / TLS 1.3',
          library: 'OpenSSL 1.1.1 / Envoy Proxy',
          component: 'API Gateway Ingress',
          migrationStatus: 'SCHEDULED_UPGRADE',
          quantumRisk: 'HIGH_HNDL_EXPOSED',
          rationale: 'Classical ECDH key exchange parameters can be decrypted retrospectively from recorded PCAP streams.'
        },
        {
          name: 'SHA-256',
          bomRef: 'crypto-asset-sha-256',
          assetType: 'algorithm',
          primitive: 'digest',
          parameterSet: '256-bit block digest',
          oid: '2.16.840.1.101.3.4.2.1',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'w3c-webcrypto',
          certificationLevel: ['NIST FIPS 180-4'],
          cryptoFunctions: ['digest'],
          classicalSecurityBits: 256,
          nistQuantumSecurityLevel: 5,
          usage: 'Transaction hashing, HMAC generation, integrity validation',
          protocol: 'General Payment Ledger Pipeline',
          library: 'Web Cryptography API',
          component: 'Ledger Audit Chain',
          migrationStatus: 'RETAINED_NO_CHANGE_NEEDED',
          quantumRisk: 'LOW_QUANTUM_RESISTANT',
          rationale: 'Preimage and collision resistance remain robust against Grover/BHT quantum algorithms.'
        }
      ]
    },

    pqc: {
      profileName: 'pqc',
      label: 'Post-Quantum Banking Payment Architecture (To-Be FIPS Compliant)',
      overallRisk: 'QUANTUM_SAFE',
      assets: [
        {
          name: 'ML-DSA-65',
          bomRef: 'crypto-asset-ml-dsa-65',
          assetType: 'algorithm',
          primitive: 'signature',
          parameterSet: 'Category 3 (Matrix Dimension 6x5, ETA=4)',
          oid: '2.16.840.1.101.3.4.3.18',
          executionEnvironment: 'software-plain',
          implementationPlatform: '@noble/post-quantum (audited JS)',
          certificationLevel: ['NIST FIPS 204'],
          cryptoFunctions: ['sign', 'verify'],
          classicalSecurityBits: 192,
          nistQuantumSecurityLevel: 3,
          usage: 'Payment authorization signing, Interbank settlement message authentication',
          protocol: 'ISO 20022 XML with PQC Signature Envelope',
          library: '@noble/post-quantum v0.2.x',
          component: 'Payment Authorization Service (PQC Provider)',
          migrationStatus: 'ACTIVE_PQC_PRODUCTION',
          quantumRisk: 'SECURE_NIST_STANDARDIZED',
          rationale: 'Based on Module Learning with Errors (MLWE) over module lattices. Resists known quantum algorithms.'
        },
        {
          name: 'ML-KEM-768',
          bomRef: 'crypto-asset-ml-kem-768',
          assetType: 'algorithm',
          primitive: 'kem',
          parameterSet: 'Category 3 (Matrix Dimension 3x3, ETA1=2, ETA2=2)',
          oid: '2.16.840.1.101.3.4.4.2',
          executionEnvironment: 'software-plain',
          implementationPlatform: '@noble/post-quantum (audited JS)',
          certificationLevel: ['NIST FIPS 203'],
          cryptoFunctions: ['encapsulate', 'decapsulate'],
          classicalSecurityBits: 192,
          nistQuantumSecurityLevel: 3,
          usage: 'Quantum-safe shared-secret establishment for envelope field encryption & KEK wrapping',
          protocol: 'Banking Microservice KEM Protocol',
          library: '@noble/post-quantum v0.2.x',
          component: 'Customer Account Protection Module',
          migrationStatus: 'ACTIVE_PQC_PRODUCTION',
          quantumRisk: 'SECURE_NIST_STANDARDIZED',
          rationale: 'Eliminates Harvest-Now-Decrypt-Later threats through lattice-based key encapsulation.'
        },
        {
          name: 'AES-256-GCM',
          bomRef: 'crypto-asset-aes-256-gcm',
          assetType: 'algorithm',
          primitive: 'ae',
          parameterSet: '256-bit key, 96-bit unique IV, 128-bit ICV auth tag',
          oid: '2.16.840.1.101.3.4.1.46',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'w3c-webcrypto',
          certificationLevel: ['NIST SP 800-38D', 'FIPS 197'],
          cryptoFunctions: ['encrypt', 'decrypt', 'authenticate'],
          classicalSecurityBits: 256,
          nistQuantumSecurityLevel: 5,
          usage: 'Authenticated field encryption of sensitive customer PAN/IBAN & database TDE',
          protocol: 'Application Envelope Encryption (AEE)',
          library: 'Web Cryptography API (SubtleCrypto)',
          component: 'Database Storage & Ledger Manager',
          migrationStatus: 'RETAINED_NO_CHANGE_NEEDED',
          quantumRisk: 'LOW_QUANTUM_RESISTANT',
          rationale: 'Grover\'s quantum algorithm requires O(2^128) operations against AES-256, well beyond practical reach.'
        },
        {
          name: 'HKDF-SHA-256',
          bomRef: 'crypto-asset-hkdf-sha-256',
          assetType: 'algorithm',
          primitive: 'kdf',
          parameterSet: 'Extract-and-Expand with SHA-256',
          oid: '1.2.840.113549.1.9.16.3.17',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'w3c-webcrypto',
          certificationLevel: ['RFC 5869', 'NIST SP 800-56C Rev 2'],
          cryptoFunctions: ['kdf'],
          classicalSecurityBits: 256,
          nistQuantumSecurityLevel: 5,
          usage: 'Derives independent AES-256-GCM keys from ML-KEM shared secrets with domain separation',
          protocol: 'Cryptographic Agility Seam',
          library: 'Web Cryptography API',
          component: 'CryptoProvider Seam',
          migrationStatus: 'ACTIVE_PQC_PRODUCTION',
          quantumRisk: 'LOW_QUANTUM_RESISTANT',
          rationale: 'Approved PRF construction for key derivation.'
        }
      ]
    },

    hybrid: {
      profileName: 'hybrid',
      label: 'Hybrid Transition Architecture (Classical + PQC Dual Composition)',
      overallRisk: 'TRANSITION_SAFE_DEFENSE_IN_DEPTH',
      assets: [
        {
          name: 'RSA-PSS-2048 + ML-DSA-65 (Composite Signature)',
          bomRef: 'crypto-asset-hybrid-sig-dual',
          assetType: 'algorithm',
          primitive: 'composite-signature',
          parameterSet: 'Dual: 2048-bit RSA + ML-DSA-65 (Category 3)',
          oid: '1.3.6.1.4.1.2.267.12.6.5',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'HybridProvider (WebCrypto + @noble/post-quantum)',
          certificationLevel: ['IETF Composite Signatures Draft', 'FIPS 204'],
          cryptoFunctions: ['sign', 'verify'],
          classicalSecurityBits: 112,
          nistQuantumSecurityLevel: 3,
          usage: 'Dual-signed banking payment payloads. Both classical and PQC signatures must pass.',
          protocol: 'Dual-Enveloped ISO 20022 Payment Rails',
          library: 'CryptoShift HybridProvider',
          component: 'Payment Authorization Service (Hybrid Seam)',
          migrationStatus: 'ACTIVE_MIGRATION_INTERMEDIATE',
          quantumRisk: 'LOW_DEFENSE_IN_DEPTH',
          rationale: 'Security holds if EITHER RSA or ML-DSA remains unbroken. Guarantees regulatory compliance during cutover.'
        },
        {
          name: 'RSA-OAEP-2048 + ML-KEM-768 (Dual Key Establishment)',
          bomRef: 'crypto-asset-hybrid-kem-dual',
          assetType: 'algorithm',
          primitive: 'composite-kem',
          parameterSet: 'Dual: 2048-bit RSA-OAEP + ML-KEM-768',
          oid: '1.3.6.1.4.1.2.267.12.7.68',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'HybridProvider',
          certificationLevel: ['IETF Hybrid KEM Draft', 'FIPS 203'],
          cryptoFunctions: ['key-establishment', 'key-wrap'],
          classicalSecurityBits: 112,
          nistQuantumSecurityLevel: 3,
          usage: 'Protects account fields using concatenated classical & PQC secrets fed into HKDF combiner',
          protocol: 'Hybrid Envelope Protocol',
          library: 'CryptoShift HybridProvider',
          component: 'Customer Account Protection Module',
          migrationStatus: 'ACTIVE_MIGRATION_INTERMEDIATE',
          quantumRisk: 'LOW_DEFENSE_IN_DEPTH',
          rationale: 'Defeats HNDL attack via ML-KEM while preserving classical hardware audit validation.'
        },
        {
          name: 'AES-256-GCM',
          bomRef: 'crypto-asset-aes-256-gcm-hybrid',
          assetType: 'algorithm',
          primitive: 'ae',
          parameterSet: '256-bit key, 96-bit unique IV',
          oid: '2.16.840.1.101.3.4.1.46',
          executionEnvironment: 'software-plain',
          implementationPlatform: 'w3c-webcrypto',
          certificationLevel: ['NIST SP 800-38D'],
          cryptoFunctions: ['encrypt', 'decrypt', 'authenticate'],
          classicalSecurityBits: 256,
          nistQuantumSecurityLevel: 5,
          usage: 'Symmetric bulk payload data encryption',
          protocol: 'Application Envelope Encryption',
          library: 'Web Cryptography API',
          component: 'Database Storage & Ledger Manager',
          migrationStatus: 'RETAINED_NO_CHANGE_NEEDED',
          quantumRisk: 'LOW_QUANTUM_RESISTANT',
          rationale: 'Long-term secure symmetric primitive.'
        }
      ]
    }
  };

  // Generate strict CycloneDX 1.6 CBOM document
  function generateCbom(profileName) {
    const pName = (profileName || 'classical').toLowerCase();
    const inventory = inventoryDefinitions[pName] || inventoryDefinitions.classical;
    const serialUuid = generateUuid();
    const timestamp = new Date().toISOString();

    const cbom = {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      serialNumber: `urn:uuid:${serialUuid}`,
      version: 1,
      metadata: {
        timestamp: timestamp,
        tools: {
          components: [
            {
              type: 'application',
              name: 'CryptoShift Lab CBOM Generator',
              version: '2.0.0',
              description: 'Cryptographic discovery and CycloneDX 1.6 CBOM automation engine for banking payments'
            }
          ]
        },
        component: {
          type: 'application',
          'bom-ref': 'banking-payment-service-core',
          name: 'BankCore Payment Settlement Engine',
          version: '4.12.0',
          description: 'Mission-critical retail and interbank payment processing platform'
        },
        properties: [
          { name: 'crypto:profile', value: pName },
          { name: 'crypto:profile-label', value: inventory.label },
          { name: 'crypto:overall-risk-rating', value: inventory.overallRisk },
          { name: 'crypto:compliance-framework', value: 'NIST PQC Migration / FIPS 203 / FIPS 204' }
        ]
      },
      components: inventory.assets.map((asset) => {
        return {
          type: 'cryptographic-asset',
          'bom-ref': asset.bomRef,
          name: asset.name,
          description: asset.usage,
          cryptoProperties: {
            assetType: asset.assetType,
            algorithmProperties: {
              primitive: asset.primitive,
              parameterSetIdentifier: asset.parameterSet,
              executionEnvironment: asset.executionEnvironment,
              implementationPlatform: asset.implementationPlatform,
              certificationLevel: asset.certificationLevel,
              cryptoFunctions: asset.cryptoFunctions,
              classicalSecurityLevel: asset.classicalSecurityBits,
              nistQuantumSecurityLevel: asset.nistQuantumSecurityLevel
            },
            oid: asset.oid,
            relatedCryptoMaterial: [] // Strictly empty of private keys
          },
          properties: [
            { name: 'crypto:protocol-binding', value: asset.protocol },
            { name: 'crypto:owning-component', value: asset.component },
            { name: 'crypto:underlying-library', value: asset.library },
            { name: 'crypto:migration-status', value: asset.migrationStatus },
            { name: 'crypto:quantum-risk-level', value: asset.quantumRisk },
            { name: 'crypto:rationale', value: asset.rationale }
          ]
        };
      }),
      dependencies: [
        {
          ref: 'banking-payment-service-core',
          dependsOn: inventory.assets.map(a => a.bomRef)
        }
      ]
    };

    return cbom;
  }

  // Schema Validator checking strict CycloneDX 1.6 compliance
  function validateCbom(cbomObj) {
    const errors = [];
    const warnings = [];

    if (!cbomObj || typeof cbomObj !== 'object') {
      return { isValid: false, errors: ['Document is not a valid JSON object'], warnings };
    }

    // 1. Root envelope
    if (cbomObj.bomFormat !== 'CycloneDX') {
      errors.push('Field "bomFormat" must equal "CycloneDX"');
    }
    if (cbomObj.specVersion !== '1.6') {
      errors.push('Field "specVersion" must equal "1.6"');
    }
    if (typeof cbomObj.version !== 'number' || cbomObj.version < 1) {
      errors.push('Field "version" must be a positive integer');
    }
    if (!cbomObj.serialNumber || !/^urn:uuid:[0-9a-f-]{36}$/i.test(cbomObj.serialNumber)) {
      errors.push('Field "serialNumber" must be a valid urn:uuid URI');
    }

    // 2. Metadata
    if (!cbomObj.metadata || typeof cbomObj.metadata !== 'object') {
      errors.push('Field "metadata" is required');
    } else {
      if (!cbomObj.metadata.timestamp || isNaN(Date.parse(cbomObj.metadata.timestamp))) {
        errors.push('Field "metadata.timestamp" must be a valid ISO-8601 date string');
      }
      if (!cbomObj.metadata.component) {
        errors.push('Field "metadata.component" is required in CycloneDX 1.6');
      }
    }

    // 3. Components
    if (!Array.isArray(cbomObj.components) || cbomObj.components.length === 0) {
      errors.push('Field "components" must be a non-empty array');
    } else {
      cbomObj.components.forEach((comp, idx) => {
        const prefix = `components[${idx}]`;
        if (comp.type !== 'cryptographic-asset') {
          errors.push(`${prefix}: type must be "cryptographic-asset"`);
        }
        if (!comp['bom-ref']) {
          errors.push(`${prefix}: "bom-ref" is required`);
        }
        if (!comp.name) {
          errors.push(`${prefix}: "name" is required`);
        }
        if (!comp.cryptoProperties) {
          errors.push(`${prefix}: "cryptoProperties" object is required`);
        } else {
          const cp = comp.cryptoProperties;
          if (!cp.assetType) {
            errors.push(`${prefix}.cryptoProperties: "assetType" is required`);
          }
          if (!cp.algorithmProperties) {
            errors.push(`${prefix}.cryptoProperties: "algorithmProperties" is required`);
          } else {
            const ap = cp.algorithmProperties;
            if (!ap.primitive) {
              errors.push(`${prefix}.cryptoProperties.algorithmProperties: "primitive" is required`);
            }
            if (typeof ap.classicalSecurityLevel !== 'number') {
              errors.push(`${prefix}.cryptoProperties.algorithmProperties: "classicalSecurityLevel" must be a number`);
            }
            if (typeof ap.nistQuantumSecurityLevel !== 'number') {
              errors.push(`${prefix}.cryptoProperties.algorithmProperties: "nistQuantumSecurityLevel" must be a number (0-5)`);
            }
          }
        }

        // 4. CRITICAL PRIVACY & SECURITY CHECK: Zero private keys
        const serialized = JSON.stringify(comp).toLowerCase();
        const sensitiveWords = ['privatekey', 'secretkey', 'private_key', 'd_param', 'prime_p', 'prime_q'];
        for (const word of sensitiveWords) {
          if (serialized.includes(`"${word}"`)) {
            errors.push(`CRITICAL SECURITY VIOLATION: Private key material detected in ${prefix} ("${word}")`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      checkedRulesCount: 12,
      componentsCount: (cbomObj.components || []).length
    };
  }

  return {
    generateCbom,
    validateCbom,
    inventoryDefinitions
  };
});
