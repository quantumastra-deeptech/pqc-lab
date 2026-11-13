# CryptoShift Lab — Static educational website

A responsive, dependency-free static website for teaching the transition from classical public-key cryptography to post-quantum cryptography in a banking payment service.

## Run locally

You can open `index.html` directly, or run a local static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to Vercel

1. Create a Git repository and add these files.
2. Import the repository in Vercel.
3. Select **Other** as the framework preset (or leave framework detection empty).
4. Set the build command to **None** and the output directory to `.`.
5. Deploy.

The included `vercel.json` provides clean static routing and basic security headers.

## Included interactions

- Four clickable learning modules with plain-language explanations.
- Classical, post-quantum and hybrid profile selector.
- Dynamic payment-flow simulation and environment-variable display.
- Signature-size comparison.
- KEM → key derivation → AES-GCM visual flow.
- CryptoProvider architecture explainer.
- Profile-aware CBOM JSON preview, copy and download.

## Important security and accuracy notes

This is an **educational UI simulation**, not a cryptographic implementation. It does not generate keys, perform ML-DSA/ML-KEM operations, encrypt real data, sign payments, or provide compliance evidence. The profile selector changes the displayed teaching model and generated example inventory only.

For a real implementation:
- Use maintained, audited implementations of FIPS 203 ML-KEM and FIPS 204 ML-DSA.
- Use a vetted KDF and authenticated encryption implementation; define nonce handling and key lifecycle.
- Define hybrid composition and downgrade protections rather than simply concatenating algorithms.
- Validate the CBOM output against the exact CycloneDX 1.6 CBOM schema and tooling you adopt.
- Have the design and implementation reviewed by qualified cryptography and application-security specialists.

## Technical details

- Plain HTML, CSS and JavaScript.
- No build step, framework, server API or runtime dependency.
- Responsive layouts for mobile, tablet and desktop.
- Accessible labels, focus states and reduced-motion handling.
