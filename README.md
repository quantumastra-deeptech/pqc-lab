# CryptoShift Lab — Classical to Post-Quantum Cryptography Migration Lab

An interactive, dual-card developer lab demonstrating how classical cryptography algorithms migrate to post-quantum cryptography (PQC) with live demo code and in-browser execution.

---

## What the Lab Does

- **Dual-Card Interactive Code Migration**:
  - **Card 1 (Classical Code AS-IS)**: An editable code card with preloaded classical cryptography code (or where users can paste their own custom code). Displays mathematical foundations, key sizes, output sizes, and quantum risk ratings.
  - **Card 2 (Post-Quantum Code TO-BE)**: Displays the exact transformed PQC code (NIST FIPS 203 ML-KEM-768, FIPS 204 ML-DSA-65, AES-256-GCM, and Hybrid TLS). Displays lattice parameters, expanded key sizes, and quantum hardness levels.
- **Side-by-Side Execution & Delta Analysis**:
  - Execute either card individually or click **"Execute Both & Compare Side-by-Side ⚡"** to benchmark wall-clock durations, payload growth ($12.9\times$ for signatures), and quantum security bits ($0 \rightarrow 192$ bits) using real in-browser WebCrypto and `@noble/post-quantum`.
- **Pre-Loaded Migration Scenarios**:
  1. **Payment Digital Signature**: `RSA-PSS-2048` $\rightarrow$ `NIST FIPS 204 ML-DSA-65`
  2. **Field Encryption**: `RSA-OAEP-2048` $\rightarrow$ `NIST FIPS 203 ML-KEM-768 + HKDF + AES-256-GCM`
  3. **Transport Security**: `TLS 1.3 ECDH P-256` $\rightarrow$ `Hybrid X25519MLKEM768 Key Exchange`
  4. **Software Architecture**: `Hardcoded Classical Coupling` $\rightarrow$ `CryptoProvider Agility Seam`
  5. **Database Envelope Migration**: `Classical KEK Wrapping` $\rightarrow$ `ML-KEM DEK Rewrapping (Zero Bulk Re-encryption)`
- **The 4 Migration Rules Cheat Sheet**:
  - Quick reference explaining asymmetric replacement vs symmetric retention.
- **Automated Verification Test Suite**:
  - 12 real unit tests runnable directly in the browser and via Node CLI (`npm test`).

---

## Local Development & Testing

```bash
# Run automated test suite
npm test

# Run locally in browser
python -m http.server 8000
# or
npx serve .
```

Visit `http://localhost:8000`.

---

## Deployment to Vercel

Configured for static deployment on Vercel with zero build step. All dependencies are pre-bundled in `js/lib/noble-pqc.bundle.js`. Security headers are defined in `vercel.json`.
