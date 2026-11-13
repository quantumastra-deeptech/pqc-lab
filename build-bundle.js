const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync(path.join(__dirname, 'js/lib'))) {
  fs.mkdirSync(path.join(__dirname, 'js/lib'), { recursive: true });
}

esbuild.buildSync({
  stdin: {
    contents: `
      import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
      import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
      import { sha256, sha384, sha512 } from '@noble/hashes/sha2.js';
      import { hkdf } from '@noble/hashes/hkdf.js';
      
      const noblePqc = {
        ml_kem768,
        ml_dsa65,
        sha256,
        sha384,
        sha512,
        hkdf
      };

      if (typeof window !== 'undefined') {
        window.noblePqc = noblePqc;
      }
      if (typeof globalThis !== 'undefined') {
        globalThis.noblePqc = noblePqc;
      }
      if (typeof module !== 'undefined' && module.exports) {
        module.exports = noblePqc;
      }
    `,
    resolveDir: __dirname,
    sourcefile: 'pqc-entry.js'
  },
  bundle: true,
  format: 'iife',
  globalName: 'noblePqcBundle',
  outfile: path.join(__dirname, 'js/lib/noble-pqc.bundle.js'),
  minify: false
});

console.log('Bundle created successfully at js/lib/noble-pqc.bundle.js');
