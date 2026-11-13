# CryptoShift Lab — Post-Quantum Banking Cryptography Platform

An interactive, technically accurate educational and demonstration platform explaining the complete end-to-end migration of a banking payment system from classical cryptography (RSA-2048, ECC, SHA-256) to post-quantum cryptography (NIST FIPS 203 ML-KEM-768 and NIST FIPS 204 ML-DSA-65).

The lab demonstrates not merely algorithm substitution, but the full architectural, software, cryptographic, protocol, infrastructure, database, performance, security and compliance changes involved in modernizing banking systems for the quantum era.

---

## Key Features & Migration Modules

- **Central Profile Switcher**: Toggle between **`CLASSICAL`**, **`HYBRID`**, and **`PQC`** profiles. Changing the posture instantly updates the architecture diagram, algorithm matrix, payment pipeline, impact report, benchmarks, and CBOM.
- **Change Impact Report**: Automated real-time analysis categorized into:
  - **CHANGED**: Components requiring algorithm, code, key, or protocol replacement.
  - **RETAINED**: Symmetric ciphers (AES-256-GCM) and hash functions (SHA-256/384) that remain quantum-safe.
  - **REQUIRES COMPATIBILITY WORK**: HSM/KMS hardware tokens, clearing networks (SWIFT/ISO 20022), and CA certificate chains.
- **Module 01 — Classical Banking Architecture**: Interactive clickable 8-step payment pipeline (Customer → Mobile App → API Gateway → Auth Service → Payment Service → Crypto Provider → Database → Banking Partner) with a component inspector.
- **Module 02 — Algorithm Transformation Matrix**: In-depth side-by-side comparison across signatures, key establishment, and symmetric primitives.
- **Module 03 — Digital Signature Migration Workbench**: Real in-browser key generation, canonical JSON payment signing, signature verification, and a "Tamper Payload (Simulate Fraud)" attack button demonstrating real FIPS 204 mathematical rejection.
- **Module 04 — Key Establishment & Encryption Workbench**: Real ML-KEM-768 key encapsulation, HKDF-SHA256 key derivation, AES-256-GCM authenticated encryption with 96-bit unique nonces and AAD, plus bit-corruption rejection tests.
- **Module 05 — TLS, Certificates & PKI**: Protocol handshake breakdown, certificate chain size inflation, TCP packet fragmentation, and CA readiness.
- **Module 06 — Application Architecture & Agility Seam**: Interactive multi-tab code viewer (`PaymentController.ts`, `CryptoProvider.ts`, `ClassicalProvider.ts`, `HybridProvider.ts`, `PQCProvider.ts`).
- **Module 07 — Key Management & HSM / KMS**: Compatibility matrix for Thales, Utimaco, AWS KMS, Google Cloud KMS, and Azure Key Vault with FIPS 140-3 readiness disclosures.
- **Module 08 — Database & Data Migration**: Key rewrapping vs bulk re-encryption analysis and long-term RFC 3161 PQC signature timestamping.
- **Module 09 — Cryptographic Inventory & CycloneDX 1.6 CBOM**: Dynamic CBOM generation with live 12-rule schema validation and strict zero-private-key leak enforcement.
- **Module 10 — Performance & Infrastructure Benchmark**: In-browser benchmarking engine measuring actual execution times (ms), key sizes, and signature expansion ratios (12.9×).
- **Module 11 — Security Threat Laboratory**: 10 interactive experiments clearly distinguishing real cryptographic tests from educational threat simulations (HNDL, Shor's factoring, downgrade attacks, algorithm substitution).
- **Module 12 — Practical 12-Phase Roadmap & Checklist**: Complete migration lifecycle with an interactive 10-item compliance readiness checklist and progress meter.
- **Automated Test Suite**: 12 comprehensive unit and integration tests executable both in-browser and via Node CLI (`npm test`).

---

## Technical Architecture & Standards

- **NIST FIPS 203**: Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM-768, Category 3).
- **NIST FIPS 204**: Module-Lattice-Based Digital Signature Standard (ML-DSA-65, Category 3).
- **NIST SP 800-38D**: Galois/Counter Mode (AES-256-GCM) with 96-bit unique nonces and 128-bit authentication tags.
- **RFC 5869**: HMAC-based Extract-and-Expand Key Derivation Function (HKDF-SHA-256).
- **CycloneDX 1.6**: Cryptographic Bill of Materials (CBOM) specification with cryptographic asset extensions.
- **Zero Runtime Dependencies**: Completely pre-bundled and static. Uses W3C Web Cryptography API (`crypto.subtle`) and the audited `@noble/post-quantum` library.

---

## Local Development & Testing

### Running Tests (Node CLI)
To run the automated cryptographic and system test suite:

```bash
npm test
```

### Running Locally
Open `index.html` directly in any modern browser, or launch a local static server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Visit `http://localhost:8000`.

---

## Deployment to Vercel

This repository is optimized for zero-configuration static deployment on Vercel:

1. Push files to your Git repository.
2. Import the project into Vercel.
3. Select **Other** as the framework preset.
4. Set Build Command to **None** (or leave empty) and Output Directory to `.`.
5. Deploy.

The included `vercel.json` applies strict security headers (`nosniff`, `strict-origin-when-cross-origin`, `DENY` clickjacking protection).

---

## Implementation Report

For a complete breakdown of implemented primitives, validation results, educational simulations, platform limitations, and enterprise banking integration requirements, refer to [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md).
