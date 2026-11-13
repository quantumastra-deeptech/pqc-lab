const profiles = {
  classical: {
    sign: "RSA-PSS-2048", enc: "RSA-OAEP", meta: "Algorithm inventory unavailable",
    signState: "CLASSICAL", encState: "CLASSICAL", metaState: "LIMITED",
    status: "Legacy profile active", color: "#f05b50",
    description: "Legacy flow selected. RSA-based public-key operations are not considered post-quantum secure against a sufficiently capable fault-tolerant quantum computer.",
    algorithms: [
      {name:"RSA-PSS", primitive:"signature", parameterSet:"2048-bit key", usage:"Payment signing", quantumStatus:"Not post-quantum secure"},
      {name:"RSA-OAEP", primitive:"asymmetric encryption", parameterSet:"2048-bit key", usage:"Account-field protection", quantumStatus:"Not post-quantum secure"}
    ]
  },
  pqc: {
    sign: "ML-DSA-65 (FIPS 204)", enc: "ML-KEM-768 + AES-256-GCM", meta: "CycloneDX 1.6 CBOM generated",
    signState: "POST-QUANTUM", encState: "HYBRID BUILDING BLOCKS", metaState: "INVENTORIED",
    status: "Post-quantum profile selected", color: "#4bb77a",
    description: "PQC flow selected. ML-DSA signs; ML-KEM establishes a shared secret, which is used with a KDF to derive an AES-GCM key for field encryption.",
    algorithms: [
      {name:"ML-DSA-65", primitive:"signature", standard:"FIPS 204", usage:"Payment signing", quantumStatus:"NIST post-quantum standard"},
      {name:"ML-KEM-768", primitive:"key encapsulation", standard:"FIPS 203", usage:"Shared-secret establishment", quantumStatus:"NIST post-quantum standard"},
      {name:"AES-256-GCM", primitive:"authenticated symmetric encryption", keyLength:256, usage:"Account-field encryption", quantumStatus:"Symmetric primitive; 256-bit key provides a conservative margin"}
    ]
  },
  hybrid: {
    sign: "RSA-PSS-2048 + ML-DSA-65", enc: "RSA-OAEP + ML-KEM-768 / AES-256-GCM", meta: "Classical + PQC inventory generated",
    signState: "DUAL SIGNATURE", encState: "DUAL KEY ESTABLISHMENT", metaState: "INVENTORIED",
    status: "Hybrid transition profile selected", color: "#4778ee",
    description: "Hybrid transition selected. Classical and post-quantum mechanisms are represented together. A real deployment must define combiner rules, verification policy, downgrade protection and interoperability.",
    algorithms: [
      {name:"RSA-PSS-2048", primitive:"signature", usage:"Classical payment signature", quantumStatus:"Not post-quantum secure"},
      {name:"ML-DSA-65", primitive:"signature", standard:"FIPS 204", usage:"Post-quantum payment signature", quantumStatus:"NIST post-quantum standard"},
      {name:"RSA-OAEP", primitive:"key establishment / encryption", usage:"Classical field protection", quantumStatus:"Not post-quantum secure"},
      {name:"ML-KEM-768", primitive:"key encapsulation", standard:"FIPS 203", usage:"Post-quantum shared-secret establishment", quantumStatus:"NIST post-quantum standard"},
      {name:"AES-256-GCM", primitive:"authenticated symmetric encryption", keyLength:256, usage:"Account-field encryption", quantumStatus:"Symmetric primitive"}
    ]
  }
};

const topics = {
  signature: {tag:"01 / POST-QUANTUM SIGNATURES", title:"A signature proves who approved the payment.", body:"RSA-PSS relies on the difficulty of factoring large integers. Shor's algorithm would break the security assumption of RSA on a sufficiently capable fault-tolerant quantum computer. ML-DSA-65 (FIPS 204), based on module-lattice problems, is a NIST-standardized post-quantum signature scheme. Its signature is much larger: the commonly quoted ML-DSA-65 signature size is 3,309 bytes, compared with a 256-byte RSA-2048 signature."},
  encryption: {tag:"02 / HARVEST-RESISTANT ENCRYPTION", title:"Protect data before someone stores it for later.", body:"A harvest-now-decrypt-later attacker can collect encrypted traffic today and attempt to decrypt it in the future. RSA-OAEP is vulnerable to Shor's algorithm. ML-KEM-768 (FIPS 203) establishes a shared secret; a KDF derives a symmetric key; AES-256-GCM encrypts and authenticates the account field. Protect the KEM private key, nonce, tag and associated metadata correctly."},
  agility: {tag:"03 / CRYPTO-AGILITY", title:"Business logic should ask for outcomes, not algorithms.", body:"A CryptoProvider interface can expose sign(), verify(), protect() and unprotect(). A configuration value such as CRYPTO_PROFILE=pqc selects an implementation. Keep policy explicit: algorithm negotiation, key identifiers, versioning, fallback rules and downgrade resistance need design and tests. A profile switch alone does not make a system secure."},
  cbom: {tag:"04 / CRYPTOGRAPHIC BILL OF MATERIALS", title:"You cannot migrate what you cannot find.", body:"A CBOM describes cryptographic assets in software and systems: algorithms, protocols, certificates, keys, libraries and where they are used. CycloneDX 1.6 supports cryptographic asset inventory concepts. A CBOM is a discovery and governance aid; it is not proof that an implementation is secure or compliant."}
};

let selectedProfile = "classical";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function cbomDocument(profileName) {
  const p = profiles[profileName];
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ vendor: "CryptoShift Lab", name: "Static educational CBOM generator", version: "1.0.0" }],
      properties: [
        { name: "crypto:profile", value: profileName },
        { name: "crypto:scope", value: "Illustrative banking payment service" },
        { name: "crypto:notice", value: "Educational example; validate against your CBOM tooling and schema." }
      ]
    },
    components: p.algorithms.map((a, i) => ({
      type: "cryptographic-asset",
      "bom-ref": `crypto-asset-${i + 1}`,
      name: a.name,
      cryptoProperties: {
        assetType: a.primitive,
        ...(a.parameterSet ? {algorithmProperties:{parameterSetIdentifier:a.parameterSet}} : {}),
        ...(a.standard ? {algorithmProperties:{standard:a.standard}} : {}),
        ...(a.keyLength ? {algorithmProperties:{keyLength:a.keyLength}} : {}),
        relatedCryptoMaterial: [],
        ...(a.usage ? {properties:[{name:"crypto:usage",value:a.usage}]} : {})
      },
      properties: [
        {name:"crypto:quantum-status",value:a.quantumStatus},
        {name:"crypto:profile",value:profileName}
      ]
    }))
  };
}

function renderProfile() {
  const p = profiles[selectedProfile];
  $("#signAlgo").textContent = p.sign;
  $("#encAlgo").textContent = p.enc;
  $("#metaAlgo").textContent = p.meta;
  $("#signState").textContent = p.signState;
  $("#encState").textContent = p.encState;
  $("#metaState").textContent = p.metaState;
  $("#resultText").textContent = p.status;
  $("#resultDot").style.background = p.color;
  $("#envValue").textContent = `CRYPTO_PROFILE=${selectedProfile}`;
  $$(".profile-option").forEach(btn => {
    const active = btn.dataset.profile === selectedProfile;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  renderCbom();
  $("#demoOutput").textContent = "Ready. Run the demo to see the selected profile's payment flow.";
}

function renderCbom() {
  const doc = cbomDocument(selectedProfile);
  $("#jsonProfile").textContent = `crypto-inventory-${selectedProfile}.json`;
  $("#jsonPreview").textContent = JSON.stringify(doc, null, 2);
}

$$(".profile-option").forEach(btn => btn.addEventListener("click", () => {
  selectedProfile = btn.dataset.profile;
  renderProfile();
}));

$$(".upgrade-card").forEach(btn => btn.addEventListener("click", () => {
  const item = topics[btn.dataset.topic];
  $("#topicDetail").innerHTML = `<div class="topic-detail-tag">${item.tag}</div><h3>${item.title}</h3><p>${item.body}</p>`;
  $$(".upgrade-card").forEach(card => card.setAttribute("aria-pressed", String(card === btn)));
  $("#topicDetail").scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"nearest"});
}));

$("#runDemo").addEventListener("click", () => {
  const p = profiles[selectedProfile];
  $("#demoOutput").textContent = `✓ Payment payload prepared → ${p.sign} → ${p.enc} → ${p.meta}. ${p.description}`;
});

$("#copyEnv").addEventListener("click", async () => {
  const text = $("#envValue").textContent;
  try { await navigator.clipboard.writeText(text); $("#copyEnv").textContent = "✓"; }
  catch { $("#copyEnv").textContent = "Select to copy"; }
  setTimeout(() => $("#copyEnv").textContent = "▢", 1500);
});

$("#copyJson").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#jsonPreview").textContent); $("#copyJson").textContent = "Copied"; }
  catch { $("#copyJson").textContent = "Copy unavailable"; }
  setTimeout(() => $("#copyJson").textContent = "Copy", 1500);
});

$("#downloadCbom").addEventListener("click", () => {
  const data = JSON.stringify(cbomDocument(selectedProfile), null, 2);
  const blob = new Blob([data], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `crypto-inventory-${selectedProfile}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

$("#menuToggle").addEventListener("click", () => {
  const nav = $(".topnav");
  const open = nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
$$(".topnav a").forEach(a => a.addEventListener("click", () => {
  $(".topnav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}));

renderProfile();
