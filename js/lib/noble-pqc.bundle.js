var noblePqcBundle = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // node_modules/@noble/hashes/_u64.js
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
  }
  function setU64FromNum(view, byteOffset, n, isLE2) {
    const h = fromNumH(n);
    const l = fromNumL(n);
    view.setUint32(byteOffset, isLE2 ? l : h, isLE2);
    view.setUint32(byteOffset + 4, isLE2 ? h : l, isLE2);
  }
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  var U32_MASK64, _32n, fromNumH, fromNumL, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H;
  var init_u64 = __esm({
    "node_modules/@noble/hashes/_u64.js"() {
      U32_MASK64 = /* @__PURE__ */ (() => BigInt(2 ** 32 - 1))();
      _32n = /* @__PURE__ */ BigInt(32);
      fromNumH = (n) => n / 2 ** 32 | 0;
      fromNumL = (n) => n >>> 0;
      shrSH = (h, _l, s) => h >>> s;
      shrSL = (h, l, s) => h << 32 - s | l >>> s;
      rotrSH = (h, l, s) => h >>> s | l << 32 - s;
      rotrSL = (h, l, s) => h << 32 - s | l >>> s;
      rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
      rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
      add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
      add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
      add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
    }
  });

  // node_modules/@noble/hashes/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
  }
  function anumber(n, title = "") {
    if (typeof n !== "number")
      throw new TypeError(atitle(title) + "expected number, got " + typeof n);
    if (!Number.isSafeInteger(n) || n < 0)
      throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
    return n;
  }
  function abool(value, title = "") {
    if (typeof value !== "boolean")
      throw new TypeError(atitle(title) + "expected boolean, got type=" + typeof value);
    return value;
  }
  function abytes(value, length, title = "") {
    if (isBytes(value) && (length === void 0 || value.length === length))
      return value;
    if (length !== void 0)
      anumber(length, "length");
    const bytes = isBytes(value);
    const ofLen = length !== void 0 ? ` of length ${length}` : "";
    const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
    const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new TypeError("expected hash wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
    if (h.outputLen < 1 || h.blockLen < 1)
      throw new Error("hash blockLen / outputLen must be >= 1");
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("hash was destroyed");
    if (checkFinished && instance.finished)
      throw new Error("digest() was already called");
  }
  function aoutput(out, instance) {
    abytes(out, void 0, "output");
    const min = instance.outputLen;
    if (!(out.length >= min)) {
      throw new RangeError('"output" expected length >= ' + min);
    }
  }
  function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function byteSwap(word) {
    return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
  }
  function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = byteSwap(arr[i]);
    }
    return arr;
  }
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes[bytes[i]];
    }
    return hex;
  }
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  function checkOpts(defaults, opts2, title = "opts") {
    aopts(defaults, "defaults");
    if (opts2 !== void 0)
      aopts(opts2, title);
    const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts2);
    return merged;
  }
  function createHasher(hashCons, info = {}) {
    if (typeof hashCons !== "function")
      throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
    info = checkOpts({}, info, "info");
    const hashC = (msg, opts2) => hashCons(opts2).update(msg).digest();
    const tmp = hashCons(void 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.canXOF = tmp.canXOF;
    hashC.create = (opts2) => hashCons(opts2);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  function randomBytes(bytesLength = 32) {
    anumber(bytesLength, "bytesLength");
    const cr = typeof globalThis === "object" ? globalThis.crypto : null;
    if (typeof cr?.getRandomValues !== "function")
      throw new Error("crypto.getRandomValues must be defined");
    if (bytesLength > 65536)
      throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
    return cr.getRandomValues(new Uint8Array(bytesLength));
  }
  var atitle, aobject, aopts, isLE, swap32IfBE, hasHexBuiltin, hexes, oidNist;
  var init_utils = __esm({
    "node_modules/@noble/hashes/utils.js"() {
      atitle = (title) => title ? `"${title}" ` : "";
      aobject = (value, label) => {
        if (value === null || typeof value !== "object" || Array.isArray(value))
          throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
      };
      aopts = (value, label) => {
        aobject(value, label);
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null)
          throw new TypeError(`"${label}" expected plain object`);
        if (Object.hasOwn(value, "__proto__"))
          throw new TypeError(`"${label}.__proto__" is not allowed`);
      };
      isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
      swap32IfBE = isLE ? (u) => u : byteSwap32;
      hasHexBuiltin = /* @__PURE__ */ (() => (
        // @ts-ignore
        typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
      ))();
      hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      oidNist = (suffix) => ({
        // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
        // Larger suffix values would need base-128 OID encoding and a different length byte.
        oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
      });
    }
  });

  // node_modules/@noble/hashes/sha3.js
  function keccakP(s, rounds = 24) {
    if (!(s instanceof Uint32Array))
      throw new TypeError('"s" expected Uint32Array(50), got type=' + typeof s);
    if (s.length !== 50)
      throw new RangeError('"s" expected Uint32Array(50), got length=' + s.length);
    anumber(rounds, "rounds");
    if (rounds < 1 || rounds > 24)
      throw new Error('"rounds" expected integer 1..24');
    for (let round = 24 - rounds; round < 24; round++) {
      for (let x = 0; x < 10; x++)
        B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
      for (let x = 0; x < 10; x += 2) {
        const idx1 = (x + 8) % 10;
        const idx0 = (x + 2) % 10;
        const B0 = B[idx0];
        const B1 = B[idx0 + 1];
        const Th = rotlH(B0, B1, 1) ^ B[idx1];
        const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
        for (let y = 0; y < 50; y += 10) {
          s[x + y] ^= Th;
          s[x + y + 1] ^= Tl;
        }
      }
      let curH = s[2];
      let curL = s[3];
      for (let t = 0; t < 24; t++) {
        const shift = SHA3_ROTL[t];
        const Th = rotlH(curH, curL, shift);
        const Tl = rotlL(curH, curL, shift);
        const PI = SHA3_PI[t];
        curH = s[PI];
        curL = s[PI + 1];
        s[PI] = Th;
        s[PI + 1] = Tl;
      }
      for (let y = 0; y < 50; y += 10) {
        const b0 = s[y], b1 = s[y + 1], b2 = s[y + 2], b3 = s[y + 3];
        s[y] ^= ~s[y + 2] & s[y + 4];
        s[y + 1] ^= ~s[y + 3] & s[y + 5];
        s[y + 2] ^= ~s[y + 4] & s[y + 6];
        s[y + 3] ^= ~s[y + 5] & s[y + 7];
        s[y + 4] ^= ~s[y + 6] & s[y + 8];
        s[y + 5] ^= ~s[y + 7] & s[y + 9];
        s[y + 6] ^= ~s[y + 8] & b0;
        s[y + 7] ^= ~s[y + 9] & b1;
        s[y + 8] ^= ~b0 & b2;
        s[y + 9] ^= ~b1 & b3;
      }
      s[0] ^= SHA3_IOTA_H[round];
      s[1] ^= SHA3_IOTA_L[round];
    }
    clean(B);
  }
  var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlSH, rotlSL, rotlBH, rotlBL, rotlH, rotlL, B, Keccak, genKeccak, sha3_256, sha3_512, genShake, shake128, shake256;
  var init_sha3 = __esm({
    "node_modules/@noble/hashes/sha3.js"() {
      init_u64();
      init_utils();
      _0n = BigInt(0);
      _1n = BigInt(1);
      _2n = BigInt(2);
      _7n = BigInt(7);
      _256n = BigInt(256);
      _0x71n = BigInt(113);
      SHA3_PI = [];
      SHA3_ROTL = [];
      _SHA3_IOTA = [];
      for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
        [x, y] = [y, (2 * x + 3 * y) % 5];
        SHA3_PI.push(2 * (5 * y + x));
        SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
        let t = _0n;
        for (let j = 0; j < 7; j++) {
          R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
          if (R & _2n)
            t ^= _1n << (_1n << BigInt(j)) - _1n;
        }
        _SHA3_IOTA.push(t);
      }
      IOTAS = split(_SHA3_IOTA, true);
      SHA3_IOTA_H = IOTAS[0];
      SHA3_IOTA_L = IOTAS[1];
      rotlSH = (h, l, s) => h << s | l >>> 32 - s;
      rotlSL = (h, l, s) => l << s | h >>> 32 - s;
      rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
      rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
      rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
      rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
      B = new Uint32Array(5 * 2);
      Keccak = class _Keccak {
        state;
        pos = 0;
        posOut = 0;
        finished = false;
        state32;
        destroyed = false;
        blockLen;
        suffix;
        outputLen;
        canXOF;
        enableXOF = false;
        rounds;
        // NOTE: we accept arguments in bytes instead of bits here.
        constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
          anumber(blockLen, "blockLen");
          anumber(suffix, "suffix");
          anumber(rounds, "rounds");
          abool(enableXOF, "enableXOF");
          this.blockLen = blockLen;
          this.suffix = suffix;
          this.outputLen = outputLen;
          this.enableXOF = enableXOF;
          this.canXOF = enableXOF;
          this.rounds = rounds;
          anumber(outputLen, "outputLen");
          if (!(0 < blockLen && blockLen < 200))
            throw new Error('"blockLen" must be 1..199');
          this.state = new Uint8Array(200);
          this.state32 = u32(this.state);
        }
        clone() {
          return this._cloneInto();
        }
        keccak() {
          swap32IfBE(this.state32);
          keccakP(this.state32, this.rounds);
          swap32IfBE(this.state32);
          this.posOut = 0;
          this.pos = 0;
        }
        update(data) {
          aexists(this);
          abytes(data);
          const { blockLen, state, state32 } = this;
          const len = data.length;
          const canUseU32 = blockLen % 4 === 0 && data.byteOffset % 4 === 0;
          const blockLen32 = blockLen / 4;
          const data32 = canUseU32 && len >= blockLen ? u32(data) : void 0;
          for (let pos = 0; pos < len; ) {
            if (data32 !== void 0 && this.pos === 0 && pos % 4 === 0 && len - pos >= blockLen) {
              for (let i = 0, o = pos / 4; i < blockLen32; i++)
                state32[i] ^= data32[o + i];
              pos += blockLen;
              this.pos = blockLen;
              this.keccak();
              continue;
            }
            const take = Math.min(blockLen - this.pos, len - pos);
            for (let i = 0; i < take; i++)
              state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen)
              this.keccak();
          }
          return this;
        }
        finish() {
          if (this.finished)
            return;
          this.finished = true;
          const { state, suffix, pos, blockLen } = this;
          state[pos] ^= suffix;
          if ((suffix & 128) !== 0 && pos === blockLen - 1)
            this.keccak();
          state[blockLen - 1] ^= 128;
          this.keccak();
        }
        writeInto(out) {
          aexists(this, false);
          abytes(out);
          this.finish();
          const bufferOut = this.state;
          const { blockLen } = this;
          for (let pos = 0, len = out.length; pos < len; ) {
            if (this.posOut >= blockLen)
              this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
          }
          return out;
        }
        xofInto(out) {
          if (!this.enableXOF)
            throw new Error("XOF is not enabled");
          return this.writeInto(out);
        }
        xof(bytes) {
          anumber(bytes);
          return this.xofInto(new Uint8Array(bytes));
        }
        digestInto(out) {
          aoutput(out, this);
          if (this.finished)
            throw new Error("digest() was already called");
          this.writeInto(out.length === this.outputLen ? out : out.subarray(0, this.outputLen));
          this.destroy();
        }
        digest() {
          const out = new Uint8Array(this.outputLen);
          this.digestInto(out);
          return out;
        }
        destroy() {
          this.destroyed = true;
          clean(this.state);
        }
        _cloneInto(to) {
          const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
          to ||= new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds);
          to.blockLen = blockLen;
          to.state32.set(this.state32);
          to.pos = this.pos;
          to.posOut = this.posOut;
          to.finished = this.finished;
          to.rounds = rounds;
          to.suffix = suffix;
          to.outputLen = outputLen;
          to.enableXOF = enableXOF;
          to.canXOF = this.canXOF;
          to.destroyed = this.destroyed;
          return to;
        }
      };
      genKeccak = (suffix, blockLen, outputLen, info = {}) => createHasher(() => new Keccak(blockLen, suffix, outputLen), info);
      sha3_256 = /* @__PURE__ */ genKeccak(
        6,
        136,
        32,
        /* @__PURE__ */ oidNist(8)
      );
      sha3_512 = /* @__PURE__ */ genKeccak(
        6,
        72,
        64,
        /* @__PURE__ */ oidNist(10)
      );
      genShake = (suffix, blockLen, outputLen, info = {}) => createHasher((opts2 = {}) => {
        opts2 = checkOpts({}, opts2);
        return new Keccak(blockLen, suffix, opts2.dkLen === void 0 ? outputLen : opts2.dkLen, true);
      }, info);
      shake128 = /* @__PURE__ */ genShake(31, 168, 16, /* @__PURE__ */ oidNist(11));
      shake256 = /* @__PURE__ */ genShake(31, 136, 32, /* @__PURE__ */ oidNist(12));
    }
  });

  // node_modules/@noble/curves/utils.js
  function aobject2(value, title = "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
    return value;
  }
  function abool2(value, title = "") {
    if (typeof value !== "boolean")
      throw new TypeError(atitle2(title) + "expected boolean, got type=" + typeof value);
    return value;
  }
  function validateObject(object, fields = {}, optFields = {}, title = "object") {
    aobject2(object, title);
    aobject2(fields, "fields");
    aobject2(optFields, "optFields");
    function checkField(fieldName, expectedType, isOpt) {
      const label = title === "object" ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
      const val = object[fieldName];
      if (!Object.hasOwn(object, fieldName) && (isOpt ? val !== void 0 : expectedType !== "function")) {
        throw new TypeError(`${label} is invalid: expected own property`);
      }
      if (isOpt && val === void 0)
        return;
      const current = typeof val;
      if (current !== expectedType || val === null)
        throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
    }
    const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
    iter(fields, false);
    iter(optFields, true);
  }
  var atitle2;
  var init_utils2 = __esm({
    "node_modules/@noble/curves/utils.js"() {
      atitle2 = (title) => title ? `"${title}" ` : "";
    }
  });

  // node_modules/@noble/curves/abstract/fft.js
  function checkU32(n, title = "n") {
    if (typeof n !== "number")
      throw new TypeError(`wrong u32 integer "${title}": expected number, got type=${typeof n}`);
    if (!Number.isSafeInteger(n) || n < 0 || n > 4294967295)
      throw new RangeError(`wrong u32 integer "${title}": expected 0..4294967295, got ${n}`);
    return n;
  }
  function isPowerOfTwo(x) {
    checkU32(x, "x");
    return (x & x - 1) === 0 && x !== 0;
  }
  function reverseBits(n, bits) {
    checkU32(n);
    if (typeof bits !== "number")
      throw new TypeError('"bits" expected number, got type=' + typeof bits);
    if (!Number.isSafeInteger(bits) || bits < 0 || bits > 32)
      throw new Error(`expected integer 0 <= bits <= 32, got ${bits}`);
    let reversed = 0;
    for (let i = 0; i < bits; i++, n >>>= 1)
      reversed = reversed << 1 | n & 1;
    return reversed >>> 0;
  }
  function log2(n) {
    checkU32(n);
    return 31 - Math.clz32(n);
  }
  function bitReversalInplace(values) {
    if (!values || typeof values !== "object" || typeof values.length !== "number")
      throw new TypeError('"values" expected array-like, got type=' + typeof values);
    const n = values.length;
    if (!isPowerOfTwo(n))
      throw new Error("expected positive power-of-two length, got " + n);
    const bits = log2(n);
    for (let i = 0; i < n; i++) {
      const j = reverseBits(i, bits);
      if (i < j) {
        const tmp = values[i];
        values[i] = values[j];
        values[j] = tmp;
      }
    }
    return values;
  }
  var FFTCore;
  var init_fft = __esm({
    "node_modules/@noble/curves/abstract/fft.js"() {
      init_utils2();
      FFTCore = (F3, coreOpts) => {
        validateObject(coreOpts, { N: "number", roots: "object", dit: "boolean" }, { invertButterflies: "boolean", skipStages: "number", brp: "boolean" }, "coreOpts");
        const { N: N3, roots, dit, invertButterflies = false, skipStages = 0, brp = true } = coreOpts;
        checkU32(N3, "coreOpts.N");
        const bits = log2(N3);
        if (!isPowerOfTwo(N3))
          throw new Error("FFT: Polynomial size should be power of two");
        checkU32(skipStages, "coreOpts.skipStages");
        const maxSkipStages = bits === 0 ? 0 : bits - 1;
        if (skipStages > maxSkipStages)
          throw new Error(`FFT: wrong skipStages: expected 0 <= skipStages <= ${maxSkipStages}`);
        if (roots.length !== N3)
          throw new Error(`FFT: wrong roots length: expected ${N3}, got ${roots.length}`);
        const isDit = dit !== invertButterflies;
        return (values) => {
          if (values.length !== N3)
            throw new Error("FFT: wrong Polynomial length");
          if (dit && brp)
            bitReversalInplace(values);
          for (let i = 0, g = 1; i < bits - skipStages; i++) {
            const s = dit ? i + 1 + skipStages : bits - i;
            const m = 1 << s;
            const m2 = m >> 1;
            const stride = N3 >> s;
            for (let k = 0; k < N3; k += m) {
              for (let j = 0, grp = g++; j < m2; j++) {
                const rootPos = invertButterflies ? dit ? N3 - grp : grp : j * stride;
                const i0 = k + j;
                const i1 = k + j + m2;
                const omega = roots[rootPos];
                const b = values[i1];
                const a = values[i0];
                if (isDit) {
                  const t = F3.mul(b, omega);
                  values[i0] = F3.add(a, t);
                  values[i1] = F3.sub(a, t);
                } else if (invertButterflies) {
                  values[i0] = F3.add(b, a);
                  values[i1] = F3.mul(F3.sub(b, a), omega);
                } else {
                  values[i0] = F3.add(a, b);
                  values[i1] = F3.mul(F3.sub(a, b), omega);
                }
              }
            }
          }
          if (!dit && brp)
            bitReversalInplace(values);
          return values;
        };
      };
    }
  });

  // node_modules/@noble/post-quantum/utils.js
  function aarray2(item, title, inner = () => {
  }) {
    if (!Array.isArray(item))
      throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
    for (let i = 0; i < item.length; i++)
      inner(item[i], `${title}[${i}]`);
    return item;
  }
  function aobject3(value, title = "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
    return value;
  }
  function equalBytes(a, b) {
    a = abytes(a);
    b = abytes(b);
    if (a.length !== b.length)
      return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
      diff |= a[i] ^ b[i];
    return diff === 0;
  }
  function copyBytes(bytes) {
    return new Uint8Array(abytes(bytes));
  }
  function validateOpts(opts2) {
    if (isBytes(opts2))
      throw new TypeError('"opts" expected object, got Uint8Array');
    aobject3(opts2, "opts");
    const proto = Object.getPrototypeOf(opts2);
    if (proto !== null && proto !== Object.prototype)
      throw new TypeError('"opts" expected a plain object');
  }
  function checkOptKeys(opts2, allowed) {
    validateOpts(opts2);
    const normalized = Object.assign(/* @__PURE__ */ Object.create(null), opts2);
    for (const [k, v] of Object.entries(normalized)) {
      if (v === void 0)
        continue;
      if (!allowed.includes(k))
        throw new TypeError('unexpected option "' + String(k) + '"; expected one of: ' + allowed.join(", "));
    }
    return Object.freeze(normalized);
  }
  function validateVerOpts(opts2, allowed = VER_OPT_KEYS) {
    const normalized = checkOptKeys(opts2, allowed);
    if (normalized.context !== void 0)
      abytes(normalized.context, void 0, "opts.context");
    return normalized;
  }
  function validateSigOpts(opts2, allowed = SIG_OPT_KEYS) {
    const normalized = checkOptKeys(opts2, allowed);
    if (normalized.context !== void 0)
      abytes(normalized.context, void 0, "opts.context");
    if (normalized.extraEntropy !== false && normalized.extraEntropy !== void 0)
      abytes(normalized.extraEntropy, void 0, "opts.extraEntropy");
    return normalized;
  }
  function splitCoder(label, ...lengths) {
    const getLength = (c) => typeof c === "number" ? c : c.bytesLen;
    const bytesLen = lengths.reduce((sum, a) => sum + getLength(a), 0);
    return {
      bytesLen,
      encode: (bufs) => {
        const res = new Uint8Array(bytesLen);
        for (let i = 0, pos = 0; i < lengths.length; i++) {
          const c = lengths[i];
          const l = getLength(c);
          const b = typeof c === "number" ? bufs[i] : c.encode(bufs[i]);
          abytes(b, l, label);
          res.set(b, pos);
          if (typeof c !== "number")
            b.fill(0);
          pos += l;
        }
        return res;
      },
      decode: (buf) => {
        abytes(buf, bytesLen, label);
        const res = [];
        for (const c of lengths) {
          const l = getLength(c);
          const b = buf.subarray(0, l);
          res.push(typeof c === "number" ? b : c.decode(b));
          buf = buf.subarray(l);
        }
        return res;
      }
    };
  }
  function vecCoder(c, vecLen) {
    const coder = c;
    const bytesLen = vecLen * coder.bytesLen;
    return {
      bytesLen,
      encode: (u) => {
        const uArr = aarray2(u, "u");
        if (uArr.length !== vecLen)
          throw new RangeError(`vecCoder.encode: wrong length=${uArr.length}. Expected: ${vecLen}`);
        const res = new Uint8Array(bytesLen);
        for (let i = 0, pos = 0; i < uArr.length; i++) {
          const b = coder.encode(uArr[i]);
          res.set(b, pos);
          b.fill(0);
          pos += b.length;
        }
        return res;
      },
      decode: (a) => {
        abytes(a, bytesLen);
        const r = [];
        for (let i = 0; i < a.length; i += coder.bytesLen)
          r.push(coder.decode(a.subarray(i, i + coder.bytesLen)));
        return r;
      }
    };
  }
  function cleanBytes(...list) {
    for (const t of list) {
      if (Array.isArray(t))
        for (const b of t)
          b.fill(0);
      else
        t.fill(0);
    }
  }
  function getMask(bits) {
    anumber(bits, "bits");
    if (bits > 32)
      throw new RangeError('"bits" expected <= 32, got ' + bits);
    return bits === 32 ? 4294967295 : ~(-1 << bits) >>> 0;
  }
  function getMessage(msg, ctx = EMPTY) {
    abytes(msg, void 0, "msg");
    abytes(ctx, void 0, "ctx");
    if (ctx.length > 255)
      throw new RangeError("context should be 255 bytes or less");
    return concatBytes(new Uint8Array([0, ctx.length]), ctx, msg);
  }
  function checkHash(hash, requiredStrength = 0) {
    if (typeof hash !== "function" || typeof hash.create !== "function")
      throw new TypeError('"hash" expected hash function, got type=' + typeof hash);
    ahash(hash);
    anumber(requiredStrength, "requiredStrength");
    const oid = hash.oid;
    abytes(oid, void 0, "hash.oid");
    if (!equalBytes(oid.subarray(0, 10), oidNistP))
      throw new Error('"hash.oid" is invalid: expected NIST hash');
    const xofLen = XOF_OID_OUTPUT_LEN[bytesToHex(oid)];
    if (xofLen !== void 0 && hash.outputLen !== xofLen) {
      throw new Error("Pre-hash XOF output length must be " + xofLen + " bytes for this OID, got: " + hash.outputLen);
    }
    const collisionResistance = hash.outputLen * 8 / 2;
    if (requiredStrength > collisionResistance) {
      throw new Error("Pre-hash security strength too low: " + collisionResistance + ", required: " + requiredStrength);
    }
  }
  function getMessagePrehash(hash, msg, ctx = EMPTY) {
    checkHash(hash);
    abytes(msg, void 0, "msg");
    abytes(ctx, void 0, "ctx");
    if (ctx.length > 255)
      throw new RangeError("context should be 255 bytes or less");
    const hashed = hash(msg);
    return concatBytes(new Uint8Array([1, ctx.length]), ctx, hash.oid, hashed);
  }
  var abytesDoc, randomBytes2, VER_OPT_KEYS, SIG_OPT_KEYS, EMPTY, oidNistP, XOF_OID_OUTPUT_LEN;
  var init_utils3 = __esm({
    "node_modules/@noble/post-quantum/utils.js"() {
      init_utils();
      abytesDoc = abytes;
      randomBytes2 = randomBytes;
      VER_OPT_KEYS = /* @__PURE__ */ Object.freeze([
        "context"
      ]);
      SIG_OPT_KEYS = /* @__PURE__ */ Object.freeze([
        "context",
        "extraEntropy"
      ]);
      EMPTY = /* @__PURE__ */ Uint8Array.of();
      oidNistP = /* @__PURE__ */ Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2]);
      XOF_OID_OUTPUT_LEN = /* @__PURE__ */ (() => ({
        "060960864801650304020b": 32,
        // id-shake128, SHAKE128(M, 256)
        "060960864801650304020c": 64
        // id-shake256, SHAKE256(M, 512)
      }))();
    }
  });

  // node_modules/@noble/post-quantum/_crystals.js
  var genCrystals, createXofShake, XOF128, XOF256;
  var init_crystals = __esm({
    "node_modules/@noble/post-quantum/_crystals.js"() {
      init_fft();
      init_sha3();
      init_utils3();
      genCrystals = (opts2) => {
        const { newPoly: newPoly2, N: N3, Q: Q3, F: F3, ROOT_OF_UNITY: ROOT_OF_UNITY3, brvBits, isKyber } = opts2;
        const mod = (a, modulo = Q3) => {
          const result = a % modulo | 0;
          return (result >= 0 ? result | 0 : modulo + result | 0) | 0;
        };
        const smod = (a, modulo = Q3) => {
          const r = mod(a, modulo) | 0;
          return (r > modulo >> 1 ? r - modulo | 0 : r) | 0;
        };
        function getZettas() {
          const out = newPoly2(N3);
          for (let i = 0; i < N3; i++) {
            const b = reverseBits(i, brvBits);
            const p = BigInt(ROOT_OF_UNITY3) ** BigInt(b) % BigInt(Q3);
            out[i] = Number(p) | 0;
          }
          return out;
        }
        const nttZetas = getZettas();
        const inv = (_a) => {
          throw new Error("not implemented");
        };
        const field = isKyber ? {
          add: (a, b) => {
            const r = a + b | 0;
            return r >= Q3 ? r - Q3 | 0 : r;
          },
          sub: (a, b) => {
            const r = a - b | 0;
            return r < 0 ? r + Q3 | 0 : r;
          },
          mul: (a, b) => mod((a | 0) * (b | 0)) | 0,
          inv
        } : {
          add: (a, b) => mod((a | 0) + (b | 0)) | 0,
          sub: (a, b) => mod((a | 0) - (b | 0)) | 0,
          mul: (a, b) => mod((a | 0) * (b | 0)) | 0,
          inv
        };
        const nttOpts = {
          N: N3,
          roots: nttZetas,
          invertButterflies: true,
          skipStages: isKyber ? 1 : 0,
          brp: false
        };
        const dif = FFTCore(field, { dit: false, ...nttOpts });
        const dit = FFTCore(field, { dit: true, ...nttOpts });
        const NTT = {
          encode: (r) => {
            return dif(r);
          },
          decode: (r) => {
            dit(r);
            for (let i = 0; i < r.length; i++)
              r[i] = mod(F3 * r[i]);
            return r;
          }
        };
        const bitsCoder = (d, c) => {
          for (let i = 0, bufLen = 0; i < N3; i++) {
            bufLen += d;
            if (bufLen > 32)
              getMask(bufLen);
            bufLen %= 8;
          }
          const mask = getMask(d);
          const bytesLen = d * (N3 / 8);
          return {
            bytesLen,
            encode: (poly_) => {
              const poly = poly_;
              const r = new Uint8Array(bytesLen);
              for (let i = 0, buf = 0, bufLen = 0, pos = 0; i < poly.length; i++) {
                buf |= (c.encode(poly[i]) & mask) << bufLen;
                bufLen += d;
                for (; bufLen >= 8; bufLen -= 8, buf >>= 8)
                  r[pos++] = buf & 255;
              }
              return r;
            },
            decode: (bytes) => {
              const r = newPoly2(N3);
              for (let i = 0, buf = 0, bufLen = 0, pos = 0; i < bytes.length; i++) {
                buf |= bytes[i] << bufLen;
                bufLen += 8;
                for (; bufLen >= d; bufLen -= d, buf >>= d)
                  r[pos++] = c.decode(buf & mask);
              }
              return r;
            }
          };
        };
        return {
          mod,
          smod,
          nttZetas,
          NTT: {
            encode: (r) => NTT.encode(r),
            decode: (r) => NTT.decode(r)
          },
          bitsCoder
        };
      };
      createXofShake = (shake) => (seed, blockLen) => {
        if (!blockLen)
          blockLen = shake.blockLen;
        const _seed = new Uint8Array(seed.length + 2);
        _seed.set(seed);
        const seedLen = seed.length;
        const buf = new Uint8Array(blockLen);
        let h = shake.create({});
        let calls = 0;
        let xofs = 0;
        return {
          stats: () => ({ calls, xofs }),
          get: (x, y) => {
            _seed[seedLen + 0] = x;
            _seed[seedLen + 1] = y;
            h.destroy();
            h = shake.create({}).update(_seed);
            calls++;
            return () => {
              xofs++;
              return h.xofInto(buf);
            };
          },
          clean: () => {
            h.destroy();
            cleanBytes(buf, _seed);
          }
        };
      };
      XOF128 = /* @__PURE__ */ createXofShake(shake128);
      XOF256 = /* @__PURE__ */ createXofShake(shake256);
    }
  });

  // node_modules/@noble/post-quantum/ml-kem.js
  function polyAdd(a_, b_) {
    const a = a_;
    const b = b_;
    for (let i = 0; i < N; i++) {
      const r = a[i] + b[i];
      a[i] = r >= Q ? r - Q : r;
    }
  }
  function polySub(a_, b_) {
    const a = a_;
    const b = b_;
    for (let i = 0; i < N; i++) {
      const r = a[i] - b[i];
      a[i] = r < 0 ? r + Q : r;
    }
  }
  function BaseCaseMultiply(a0, a1, b0, b1, zeta) {
    const c0 = crystals.mod(crystals.mod(a1 * b1) * zeta + a0 * b0);
    const c1 = crystals.mod(a0 * b1 + a1 * b0);
    return { c0, c1 };
  }
  function MultiplyNTTs(f_, g_) {
    const f = f_;
    const g = g_;
    for (let i = 0; i < N / 2; i++) {
      let z = crystals.nttZetas[64 + (i >> 1)];
      if (i & 1)
        z = -z;
      const { c0, c1 } = BaseCaseMultiply(f[2 * i + 0], f[2 * i + 1], g[2 * i + 0], g[2 * i + 1], z);
      f[2 * i + 0] = c0;
      f[2 * i + 1] = c1;
    }
    return f;
  }
  function SampleNTT(xof_) {
    const xof = xof_;
    const r = new Uint16Array(N);
    for (let j = 0; j < N; ) {
      const b = xof();
      if (b.length % 3)
        throw new Error("SampleNTT: unaligned block");
      for (let i = 0; j < N && i + 3 <= b.length; i += 3) {
        const d1 = (b[i + 0] >> 0 | b[i + 1] << 8) & 4095;
        const d2 = (b[i + 1] >> 4 | b[i + 2] << 4) & 4095;
        if (d1 < Q)
          r[j++] = d1;
        if (j < N && d2 < Q)
          r[j++] = d2;
      }
    }
    return r;
  }
  function sampleCBD(PRF_, seed, nonce, eta) {
    const PRF = PRF_;
    return sampleCBDBytes(PRF(eta * N / 4, seed, nonce), eta);
  }
  function createKyber(opts2) {
    const rawOpts = opts2;
    const KPKE = genKPKE(rawOpts);
    const { HASH256, HASH512, KDF } = rawOpts;
    const { secretCoder: KPKESecretCoder, lengths } = KPKE;
    const secretCoder = splitCoder("secretKey", lengths.secretKey, lengths.publicKey, 32, 32);
    const msgLen = 32;
    const seedLen = 64;
    const validateModulus = (publicKey, fn) => {
      const eke = publicKey.subarray(0, 384 * rawOpts.K);
      const ek = KPKESecretCoder.encode(KPKESecretCoder.decode(copyBytes(eke)));
      const ok = equalBytes(ek, eke);
      cleanBytes(ek);
      if (!ok)
        throw new Error(`ML-KEM.${fn}: wrong publicKey modulus`);
    };
    const kemLengths = Object.freeze({
      ...lengths,
      seed: 64,
      msg: msgLen,
      msgRand: msgLen,
      secretKey: secretCoder.bytesLen
    });
    return Object.freeze({
      info: Object.freeze({ type: "ml-kem" }),
      lengths: kemLengths,
      keygen: (seed) => {
        const ownSeed = seed === void 0;
        const s = ownSeed ? randomBytes2(seedLen) : seed;
        let sk;
        let publicKeyHash;
        try {
          abytesDoc(s, seedLen, "seed");
          const keys = KPKE.keygen(s.subarray(0, 32));
          const publicKey = keys.publicKey;
          sk = keys.secretKey;
          publicKeyHash = HASH256(publicKey);
          const secretKey = secretCoder.encode([sk, publicKey, publicKeyHash, s.subarray(32)]);
          return {
            publicKey,
            secretKey
          };
        } finally {
          if (sk !== void 0)
            cleanBytes(sk);
          if (publicKeyHash !== void 0)
            cleanBytes(publicKeyHash);
          if (ownSeed)
            cleanBytes(s);
        }
      },
      getPublicKey: (secretKey) => {
        const [_sk, publicKey, _publicKeyHash, _z] = secretCoder.decode(secretKey);
        return Uint8Array.from(publicKey);
      },
      encapsulate: (publicKey, msg) => {
        const ownMsg = msg === void 0;
        const m = ownMsg ? randomBytes2(msgLen) : msg;
        let kr;
        try {
          abytesDoc(publicKey, lengths.publicKey, "publicKey");
          abytesDoc(m, msgLen, "message");
          validateModulus(publicKey, "encapsulate");
          kr = HASH512.create().update(m).update(HASH256(publicKey)).digest();
          const cipherText = KPKE.encrypt(publicKey, m, kr.subarray(32, 64));
          return {
            cipherText,
            sharedSecret: kr.subarray(0, 32)
          };
        } finally {
          if (kr !== void 0)
            cleanBytes(kr.subarray(32));
          if (ownMsg)
            cleanBytes(m);
        }
      },
      decapsulate: (cipherText, secretKey) => {
        abytesDoc(secretKey, secretCoder.bytesLen, "secretKey");
        abytesDoc(cipherText, lengths.cipherText, "cipherText");
        const k768 = secretCoder.bytesLen - 96;
        const start = k768 + 32;
        const test = HASH256(secretKey.subarray(k768 / 2, start));
        if (!equalBytes(test, secretKey.subarray(start, start + 32)))
          throw new Error("invalid secretKey: hash check failed");
        const [sk, publicKey, publicKeyHash, z] = secretCoder.decode(secretKey);
        const msg = KPKE.decrypt(cipherText, sk);
        const kr = HASH512.create().update(msg).update(publicKeyHash).digest();
        const Khat = kr.subarray(0, 32);
        const cipherText2 = KPKE.encrypt(publicKey, msg, kr.subarray(32, 64));
        const isValid = equalBytes(cipherText, cipherText2);
        const Kbar = KDF.create({ dkLen: 32 }).update(z).update(cipherText).digest();
        cleanBytes(msg, cipherText2, kr.subarray(32), !isValid ? Khat : Kbar);
        return isValid ? Khat : Kbar;
      },
      /**
       * Experimental prototype: pre-expand a public key so repeated encapsulate/decapsulate
       * against the same key skip re-validation, H(ek), t̂ decoding and the K² SampleNTT
       * XOF expansions of Â. Only public data is cached; see {@link KEMPrepared}.
       */
      prepare: (publicKey) => {
        abytesDoc(publicKey, lengths.publicKey, "publicKey");
        validateModulus(publicKey, "prepare");
        const ek = copyBytes(publicKey);
        const publicKeyHash = HASH256(ek);
        const cached = KPKE.prepare(ek);
        return Object.freeze({
          publicKey: ek,
          encapsulate: (msg) => {
            const ownMsg = msg === void 0;
            const m = ownMsg ? randomBytes2(msgLen) : msg;
            let kr;
            try {
              abytesDoc(m, msgLen, "message");
              kr = HASH512.create().update(m).update(publicKeyHash).digest();
              const cipherText = cached.encrypt(m, kr.subarray(32, 64));
              return {
                cipherText,
                sharedSecret: kr.subarray(0, 32)
              };
            } finally {
              if (kr !== void 0)
                cleanBytes(kr.subarray(32));
              if (ownMsg)
                cleanBytes(m);
            }
          },
          decapsulate: (cipherText, secretKey) => {
            abytesDoc(secretKey, secretCoder.bytesLen, "secretKey");
            abytesDoc(cipherText, lengths.cipherText, "cipherText");
            const [sk, ekEmbedded, storedHash, z] = secretCoder.decode(secretKey);
            if (!equalBytes(ekEmbedded, ek) || !equalBytes(storedHash, publicKeyHash))
              throw new Error("ML-KEM.decapsulate: secretKey does not match prepared publicKey");
            const msg = KPKE.decrypt(cipherText, sk);
            const kr = HASH512.create().update(msg).update(publicKeyHash).digest();
            const Khat = kr.subarray(0, 32);
            const cipherText2 = cached.encrypt(msg, kr.subarray(32, 64));
            const isValid = equalBytes(cipherText, cipherText2);
            const Kbar = KDF.create({ dkLen: 32 }).update(z).update(cipherText).digest();
            cleanBytes(msg, cipherText2, kr.subarray(32), !isValid ? Khat : Kbar);
            return isValid ? Khat : Kbar;
          },
          clean: cached.clean
        });
      }
    });
  }
  function shakePRF(dkLen, key, nonce) {
    return shake256.create({ dkLen }).update(key).update(new Uint8Array([nonce])).digest();
  }
  var N, Q, F, ROOT_OF_UNITY, crystals, PARAMS, compress, byteCoder, polyCoder, sampleCBDBytes, genKPKE, opts, mk, ml_kem768;
  var init_ml_kem = __esm({
    "node_modules/@noble/post-quantum/ml-kem.js"() {
      init_sha3();
      init_utils();
      init_crystals();
      init_utils3();
      N = 256;
      Q = 3329;
      F = 3303;
      ROOT_OF_UNITY = 17;
      crystals = /* @__PURE__ */ genCrystals({
        N,
        Q,
        F,
        ROOT_OF_UNITY,
        newPoly: (n) => new Uint16Array(n),
        brvBits: 7,
        isKyber: true
      });
      PARAMS = /* @__PURE__ */ (() => Object.freeze({
        512: Object.freeze({ N, Q, K: 2, ETA1: 3, ETA2: 2, du: 10, dv: 4, RBGstrength: 128 }),
        768: Object.freeze({ N, Q, K: 3, ETA1: 2, ETA2: 2, du: 10, dv: 4, RBGstrength: 192 }),
        1024: Object.freeze({ N, Q, K: 4, ETA1: 2, ETA2: 2, du: 11, dv: 5, RBGstrength: 256 })
      }))();
      compress = (d) => {
        if (d >= 12)
          return { encode: (i) => i, decode: (i) => i >= Q ? i - Q : i };
        const a = 2 ** (d - 1);
        return {
          // This only matches standalone Compress_d after bitsCoder masks the result into Z_(2^d).
          encode: (i) => ((i << d) + Q / 2) / Q,
          // const decompress = (i: number) => round((Q / 2 ** d) * i);
          decode: (i) => i * Q + a >>> d
        };
      };
      byteCoder = (d) => crystals.bitsCoder(d, d === 12 ? { encode: (i) => i, decode: (i) => i >= Q ? i - Q : i } : { encode: (i) => i, decode: (i) => i });
      polyCoder = (d) => d === 12 ? byteCoder(12) : crystals.bitsCoder(d, compress(d));
      sampleCBDBytes = (buf, eta) => {
        const r = new Uint16Array(N);
        const b32 = u32(buf);
        swap32IfBE(b32);
        let len = 0;
        for (let i = 0, p = 0, bb = 0, t0 = 0; i < b32.length; i++) {
          let b = b32[i];
          for (let j = 0; j < 32; j++) {
            bb += b & 1;
            b >>= 1;
            len += 1;
            if (len === eta) {
              t0 = bb;
              bb = 0;
            } else if (len === 2 * eta) {
              r[p++] = crystals.mod(t0 - bb);
              bb = 0;
              len = 0;
            }
          }
        }
        swap32IfBE(b32);
        if (len)
          throw new Error(`sampleCBD: leftover bits: ${len}`);
        return r;
      };
      genKPKE = (opts_) => {
        const opts2 = opts_;
        const { K, PRF, XOF, HASH512, ETA1, ETA2, du, dv } = opts2;
        const poly1 = polyCoder(1);
        const polyV = polyCoder(dv);
        const polyU = polyCoder(du);
        const publicCoder = splitCoder("publicKey", vecCoder(polyCoder(12), K), 32);
        const secretCoder = vecCoder(polyCoder(12), K);
        const cipherCoder = splitCoder("ciphertext", vecCoder(polyU, K), polyV);
        const seedCoder = splitCoder("seed", 32, 32);
        const encryptCore = (tHat, getA, msg, seed) => {
          const rHat = [];
          for (let i = 0; i < K; i++)
            rHat.push(crystals.NTT.encode(sampleCBD(PRF, seed, i, ETA1)));
          const tmp2 = new Uint16Array(N);
          const u = [];
          for (let i = 0; i < K; i++) {
            const e1 = sampleCBD(PRF, seed, K + i, ETA2);
            const tmp = new Uint16Array(N);
            for (let j = 0; j < K; j++) {
              const aij = getA(i, j);
              polyAdd(tmp, MultiplyNTTs(aij, rHat[j]));
            }
            polyAdd(e1, crystals.NTT.decode(tmp));
            u.push(e1);
            polyAdd(tmp2, MultiplyNTTs(tHat[i], rHat[i]));
            cleanBytes(tmp);
          }
          const e2 = sampleCBD(PRF, seed, 2 * K, ETA2);
          polyAdd(e2, crystals.NTT.decode(tmp2));
          const v = poly1.decode(msg);
          polyAdd(v, e2);
          cleanBytes(tHat, rHat, tmp2, e2);
          return cipherCoder.encode([u, v]);
        };
        return {
          secretCoder,
          lengths: {
            secretKey: secretCoder.bytesLen,
            publicKey: publicCoder.bytesLen,
            cipherText: cipherCoder.bytesLen
          },
          keygen: (seed) => {
            abytesDoc(seed, 32, "seed");
            const seedDst = new Uint8Array(33);
            seedDst.set(seed);
            seedDst[32] = K;
            const seedHash = HASH512(seedDst);
            const [rho, sigma] = seedCoder.decode(seedHash);
            const sHat = [];
            const tHat = [];
            for (let i = 0; i < K; i++)
              sHat.push(crystals.NTT.encode(sampleCBD(PRF, sigma, i, ETA1)));
            const x = XOF(rho);
            for (let i = 0; i < K; i++) {
              const e = crystals.NTT.encode(sampleCBD(PRF, sigma, K + i, ETA1));
              for (let j = 0; j < K; j++) {
                const aji = SampleNTT(x.get(j, i));
                polyAdd(e, MultiplyNTTs(aji, sHat[j]));
              }
              tHat.push(e);
            }
            x.clean();
            const res = {
              publicKey: publicCoder.encode([tHat, rho]),
              secretKey: secretCoder.encode(sHat)
            };
            cleanBytes(rho, sigma, sHat, tHat, seedDst, seedHash);
            return res;
          },
          encrypt: (publicKey, msg, seed) => {
            const [tHat, rho] = publicCoder.decode(publicKey);
            const x = XOF(rho);
            const res = encryptCore(tHat, (i, j) => SampleNTT(x.get(i, j)), msg, seed);
            x.clean();
            return res;
          },
          // Expands the full Â matrix (public data derived from rho) once, so repeated encryptions
          // against the same ek skip the K² SampleNTT XOF expansions. Cached polys are copied per
          // call because encryptCore mutates its inputs in place.
          prepare: (publicKey) => {
            const [tHat, rho] = publicCoder.decode(publicKey);
            const x = XOF(rho);
            const A = [];
            for (let i = 0; i < K; i++)
              for (let j = 0; j < K; j++)
                A.push(SampleNTT(x.get(i, j)));
            x.clean();
            return {
              encrypt: (msg, seed) => encryptCore(tHat.map((p) => p.slice()), (i, j) => A[i * K + j].slice(), msg, seed),
              clean: () => cleanBytes(tHat, A)
            };
          },
          decrypt: (cipherText, privateKey) => {
            const [u, v] = cipherCoder.decode(cipherText);
            const sk = secretCoder.decode(privateKey);
            const tmp = new Uint16Array(N);
            for (let i = 0; i < K; i++)
              polyAdd(tmp, MultiplyNTTs(sk[i], crystals.NTT.encode(u[i])));
            polySub(v, crystals.NTT.decode(tmp));
            const res = poly1.encode(v);
            cleanBytes(tmp, sk, u, v);
            return res;
          }
        };
      };
      opts = /* @__PURE__ */ (() => ({
        HASH256: sha3_256,
        HASH512: sha3_512,
        KDF: shake256,
        XOF: XOF128,
        PRF: shakePRF
      }))();
      mk = (params) => createKyber({
        ...opts,
        ...params
      });
      ml_kem768 = /* @__PURE__ */ (() => mk(PARAMS[768]))();
    }
  });

  // node_modules/@noble/post-quantum/ml-dsa.js
  function validateInternalOpts(opts2, allowed) {
    const normalized = checkOptKeys(opts2, allowed);
    if (normalized.externalMu !== void 0)
      abool2(normalized.externalMu, "opts.externalMu");
    return normalized;
  }
  function RejNTTPoly(xof_) {
    const xof = xof_;
    const r = newPoly(N2);
    for (let j = 0; j < N2; ) {
      const b = xof();
      if (b.length % 3)
        throw new Error("RejNTTPoly: unaligned block");
      for (let i = 0; j < N2 && i <= b.length - 3; i += 3) {
        const t = (b[i + 0] | b[i + 1] << 8 | b[i + 2] << 16) & 8388607;
        if (t < Q2)
          r[j++] = t;
      }
    }
    return r;
  }
  function getDilithium(opts_) {
    const opts2 = opts_;
    const { K, L, GAMMA1, GAMMA2, TAU, ETA, OMEGA } = opts2;
    const { CRH_BYTES, TR_BYTES, C_TILDE_BYTES, XOF128: XOF1282, XOF256: XOF2562, securityLevel } = opts2;
    if (![2, 4].includes(ETA))
      throw new Error("Wrong ETA");
    if (![1 << 17, 1 << 19].includes(GAMMA1))
      throw new Error("Wrong GAMMA1");
    if (![GAMMA2_1, GAMMA2_2].includes(GAMMA2))
      throw new Error("Wrong GAMMA2");
    const BETA = TAU * ETA;
    const decompose = (r) => {
      const rPlus = crystals2.mod(r);
      const r0 = crystals2.smod(rPlus, 2 * GAMMA2) | 0;
      if (rPlus - r0 === Q2 - 1)
        return { r1: 0 | 0, r0: r0 - 1 | 0 };
      const r1 = Math.floor((rPlus - r0) / (2 * GAMMA2)) | 0;
      return { r1, r0 };
    };
    const HighBits = (r) => decompose(r).r1;
    const LowBits = (r) => decompose(r).r0;
    const MakeHint = (z, r) => {
      const res0 = z <= GAMMA2 || z > Q2 - GAMMA2 || z === Q2 - GAMMA2 && r === 0 ? 0 : 1;
      return res0;
    };
    const HINT_M = Math.floor((Q2 - 1) / (2 * GAMMA2));
    const UseHint = (h, r) => {
      const { r1, r0 } = decompose(r);
      if (h === 1)
        return r0 > 0 ? crystals2.mod(r1 + 1, HINT_M) | 0 : crystals2.mod(r1 - 1, HINT_M) | 0;
      return r1 | 0;
    };
    const Power2Round = (r) => {
      const rPlus = crystals2.mod(r);
      const r0 = crystals2.smod(rPlus, 2 ** D) | 0;
      return { r1: Math.floor((rPlus - r0) / 2 ** D) | 0, r0 };
    };
    const hintCoder = {
      bytesLen: OMEGA + K,
      encode: (h_) => {
        const h = h_;
        if (h === false)
          throw new Error("hint.encode: hint is false");
        const res = new Uint8Array(OMEGA + K);
        for (let i = 0, k = 0; i < K; i++) {
          for (let j = 0; j < N2; j++)
            if (h[i][j] !== 0)
              res[k++] = j;
          res[OMEGA + i] = k;
        }
        return res;
      },
      decode: (buf) => {
        const h = [];
        let k = 0;
        for (let i = 0; i < K; i++) {
          const hi = newPoly(N2);
          if (buf[OMEGA + i] < k || buf[OMEGA + i] > OMEGA)
            return false;
          for (let j = k; j < buf[OMEGA + i]; j++) {
            if (j > k && buf[j] <= buf[j - 1])
              return false;
            hi[buf[j]] = 1;
          }
          k = buf[OMEGA + i];
          h.push(hi);
        }
        for (let j = k; j < OMEGA; j++)
          if (buf[j] !== 0)
            return false;
        return h;
      }
    };
    const ETACoder = polyCoder2(ETA === 2 ? 3 : 4, (i) => ETA - i, (i) => {
      if (!(-ETA <= i && i <= ETA))
        throw new Error(`malformed key s1/s3 ${i} outside of ETA range [${-ETA}, ${ETA}]`);
      return i;
    });
    const T0Coder = polyCoder2(13, (i) => (1 << D - 1) - i);
    const T1Coder = polyCoder2(10);
    const ZCoder = polyCoder2(GAMMA1 === 1 << 17 ? 18 : 20, (i) => crystals2.smod(GAMMA1 - i));
    const W1Coder = polyCoder2(GAMMA2 === GAMMA2_1 ? 6 : 4);
    const W1Vec = vecCoder(W1Coder, K);
    const publicCoder = splitCoder("publicKey", 32, vecCoder(T1Coder, K));
    const secretCoder = splitCoder("secretKey", 32, 32, TR_BYTES, vecCoder(ETACoder, L), vecCoder(ETACoder, K), vecCoder(T0Coder, K));
    const sigCoder = splitCoder("signature", C_TILDE_BYTES, vecCoder(ZCoder, L), hintCoder);
    const CoefFromHalfByte = ETA === 2 ? (n) => n < 15 ? 2 - n % 5 : false : (n) => n < 9 ? 4 - n : false;
    function RejBoundedPoly(xof_) {
      const xof = xof_;
      const r = newPoly(N2);
      for (let j = 0; j < N2; ) {
        const b = xof();
        for (let i = 0; j < N2 && i < b.length; i += 1) {
          const d1 = CoefFromHalfByte(b[i] & 15);
          const d2 = CoefFromHalfByte(b[i] >> 4 & 15);
          if (d1 !== false)
            r[j++] = d1;
          if (j < N2 && d2 !== false)
            r[j++] = d2;
        }
      }
      return r;
    }
    const SampleInBall = (seed) => {
      const pre = newPoly(N2);
      const s = shake256.create({}).update(seed);
      const buf = new Uint8Array(shake256.blockLen);
      s.xofInto(buf);
      const masks = buf.slice(0, 8);
      for (let i = N2 - TAU, pos = 8, maskPos = 0, maskBit = 0; i < N2; i++) {
        let b = i + 1;
        for (; b > i; ) {
          b = buf[pos++];
          if (pos < shake256.blockLen)
            continue;
          s.xofInto(buf);
          pos = 0;
        }
        pre[i] = pre[b];
        pre[b] = 1 - ((masks[maskPos] >> maskBit++ & 1) << 1);
        if (maskBit >= 8) {
          maskPos++;
          maskBit = 0;
        }
      }
      return pre;
    };
    const polyPowerRound = (p_) => {
      const p = p_;
      const res0 = newPoly(N2);
      const res1 = newPoly(N2);
      for (let i = 0; i < p.length; i++) {
        const { r0, r1 } = Power2Round(p[i]);
        res0[i] = r0;
        res1[i] = r1;
      }
      return { r0: res0, r1: res1 };
    };
    const polyUseHint = (u_, h_) => {
      const u = u_;
      const h = h_;
      for (let i = 0; i < N2; i++)
        u[i] = UseHint(h[i], u[i]);
      return u;
    };
    const polyMakeHint = (a_, b_) => {
      const a = a_;
      const b = b_;
      const v = newPoly(N2);
      let cnt = 0;
      for (let i = 0; i < N2; i++) {
        const h = MakeHint(a[i], b[i]);
        v[i] = h;
        cnt += h;
      }
      return { v, cnt };
    };
    const signRandBytes = 32;
    const seedCoder = splitCoder("seed", 32, 64, 32);
    const internal = Object.freeze({
      info: Object.freeze({ type: "internal-ml-dsa" }),
      lengths: Object.freeze({
        secretKey: secretCoder.bytesLen,
        publicKey: publicCoder.bytesLen,
        seed: 32,
        signature: sigCoder.bytesLen,
        signRand: signRandBytes
      }),
      keygen: (seed) => {
        const seedDst = new Uint8Array(32 + 2);
        const randSeed = seed === void 0;
        if (randSeed)
          seed = randomBytes2(32);
        abytesDoc(seed, 32, "seed");
        seedDst.set(seed);
        if (randSeed)
          cleanBytes(seed);
        seedDst[32] = K;
        seedDst[33] = L;
        const [rho, rhoPrime, K_] = seedCoder.decode(shake256(seedDst, { dkLen: seedCoder.bytesLen }));
        const xofPrime = XOF2562(rhoPrime);
        const s1 = [];
        for (let i = 0; i < L; i++)
          s1.push(RejBoundedPoly(xofPrime.get(i & 255, i >> 8 & 255)));
        const s2 = [];
        for (let i = L; i < L + K; i++)
          s2.push(RejBoundedPoly(xofPrime.get(i & 255, i >> 8 & 255)));
        const s1Hat = s1.map((i) => crystals2.NTT.encode(i.slice()));
        const t0 = [];
        const t1 = [];
        const xof = XOF1282(rho);
        const t = newPoly(N2);
        for (let i = 0; i < K; i++) {
          cleanBytes(t);
          for (let j = 0; j < L; j++) {
            const aij = RejNTTPoly(xof.get(j, i));
            polyAdd2(t, MultiplyNTTs2(aij, s1Hat[j]));
          }
          crystals2.NTT.decode(t);
          const { r0, r1 } = polyPowerRound(polyAdd2(t, s2[i]));
          t0.push(r0);
          t1.push(r1);
        }
        const publicKey = publicCoder.encode([rho, t1]);
        const tr = shake256(publicKey, { dkLen: TR_BYTES });
        const secretKey = secretCoder.encode([rho, K_, tr, s1, s2, t0]);
        xof.clean();
        xofPrime.clean();
        cleanBytes(rho, rhoPrime, K_, s1, s2, s1Hat, t, t0, t1, tr, seedDst);
        return {
          publicKey,
          secretKey
        };
      },
      getPublicKey: (secretKey) => {
        const [rho, _K, _tr, s1, s2, _t0] = secretCoder.decode(secretKey);
        const xof = XOF1282(rho);
        const s1Hat = s1.map((p) => crystals2.NTT.encode(p.slice()));
        const t1 = [];
        const tmp = newPoly(N2);
        for (let i = 0; i < K; i++) {
          tmp.fill(0);
          for (let j = 0; j < L; j++) {
            const aij = RejNTTPoly(xof.get(j, i));
            polyAdd2(tmp, MultiplyNTTs2(aij, s1Hat[j]));
          }
          crystals2.NTT.decode(tmp);
          polyAdd2(tmp, s2[i]);
          const { r1 } = polyPowerRound(tmp);
          t1.push(r1);
        }
        xof.clean();
        cleanBytes(tmp, s1Hat, _t0, s1, s2);
        return publicCoder.encode([rho, t1]);
      },
      // NOTE: random is optional.
      sign: (msg, secretKey, opts3 = {}) => {
        opts3 = validateSigOpts(opts3, INTERNAL_SIG_OPT_KEYS);
        opts3 = validateInternalOpts(opts3, INTERNAL_SIG_OPT_KEYS);
        const { extraEntropy: random, externalMu = false } = opts3;
        if (externalMu)
          abytesDoc(msg, CRH_BYTES, "mu");
        const ownRnd = random === false || random === void 0;
        const rnd = random === false ? new Uint8Array(32) : random === void 0 ? randomBytes2(signRandBytes) : random;
        abytesDoc(rnd, 32, "extraEntropy");
        const decoded = (() => {
          try {
            return secretCoder.decode(secretKey);
          } catch (error) {
            if (ownRnd)
              cleanBytes(rnd);
            throw error;
          }
        })();
        const [rho, _K, tr, s1, s2, t0] = decoded;
        const A = [];
        const xof = XOF1282(rho);
        for (let i = 0; i < K; i++) {
          const pv = [];
          for (let j = 0; j < L; j++)
            pv.push(RejNTTPoly(xof.get(j, i)));
          A.push(pv);
        }
        xof.clean();
        for (let i = 0; i < L; i++)
          crystals2.NTT.encode(s1[i]);
        for (let i = 0; i < K; i++) {
          crystals2.NTT.encode(s2[i]);
          crystals2.NTT.encode(t0[i]);
        }
        const mu = externalMu ? msg : (
          // 6: µ ← H(tr||M, 512)
          //    ▷ Compute message representative µ
          shake256.create({ dkLen: CRH_BYTES }).update(tr).update(msg).digest()
        );
        const rhoprime = shake256.create({ dkLen: CRH_BYTES }).update(_K).update(rnd).update(mu).digest();
        if (ownRnd)
          cleanBytes(rnd);
        abytesDoc(rhoprime, CRH_BYTES);
        const x256 = XOF2562(rhoprime, ZCoder.bytesLen);
        main_loop: for (let kappa = 0; ; ) {
          const y = [];
          for (let i = 0; i < L; i++, kappa++)
            y.push(ZCoder.decode(x256.get(kappa & 255, kappa >> 8)()));
          const z = y.map((i) => crystals2.NTT.encode(i.slice()));
          const w = [];
          for (let i = 0; i < K; i++) {
            const wi = newPoly(N2);
            for (let j = 0; j < L; j++)
              polyAdd2(wi, MultiplyNTTs2(A[i][j], z[j]));
            crystals2.NTT.decode(wi);
            w.push(wi);
          }
          const w1 = w.map((j) => j.map(HighBits));
          const cTilde = shake256.create({ dkLen: C_TILDE_BYTES }).update(mu).update(W1Vec.encode(w1)).digest();
          const cHat = crystals2.NTT.encode(SampleInBall(cTilde));
          const cs1 = s1.map((i) => MultiplyNTTs2(i, cHat));
          for (let i = 0; i < L; i++) {
            polyAdd2(crystals2.NTT.decode(cs1[i]), y[i]);
            if (polyChknorm(cs1[i], GAMMA1 - BETA)) {
              cleanBytes(cTilde, cs1, cHat, w1, w, z, y);
              continue main_loop;
            }
          }
          let cnt = 0;
          const h = [];
          for (let i = 0; i < K; i++) {
            const cs2 = crystals2.NTT.decode(MultiplyNTTs2(s2[i], cHat));
            const r0 = polySub2(w[i], cs2).map(LowBits);
            if (polyChknorm(r0, GAMMA2 - BETA)) {
              cleanBytes(cTilde, cs1, cHat, w1, w, z, y, h, cs2, r0);
              continue main_loop;
            }
            const ct0 = crystals2.NTT.decode(MultiplyNTTs2(t0[i], cHat));
            if (polyChknorm(ct0, GAMMA2)) {
              cleanBytes(cTilde, cs1, cHat, w1, w, z, y, h, cs2, r0, ct0);
              continue main_loop;
            }
            polyAdd2(r0, ct0);
            const hint = polyMakeHint(r0, w1[i]);
            h.push(hint.v);
            cnt += hint.cnt;
          }
          if (cnt > OMEGA) {
            cleanBytes(cTilde, cs1, cHat, w1, w, z, y, h);
            continue;
          }
          x256.clean();
          const res = sigCoder.encode([cTilde, cs1, h]);
          cleanBytes(cTilde, cs1, h, cHat, w1, w, z, y, rhoprime, s1, s2, t0, ...A);
          if (!externalMu)
            cleanBytes(mu);
          return res;
        }
        throw new Error("Unreachable code path reached, report this error");
      },
      verify: (sig, msg, publicKey, opts3 = {}) => {
        opts3 = validateInternalOpts(opts3, INTERNAL_VER_OPT_KEYS);
        const { externalMu = false } = opts3;
        if (externalMu)
          abytesDoc(msg, CRH_BYTES, "mu");
        const [rho, t1] = publicCoder.decode(publicKey);
        const tr = shake256(publicKey, { dkLen: TR_BYTES });
        if (sig.length !== sigCoder.bytesLen)
          return false;
        const [cTilde, z, h] = sigCoder.decode(sig);
        if (h === false)
          return false;
        for (let i = 0; i < L; i++)
          if (polyChknorm(z[i], GAMMA1 - BETA))
            return false;
        const mu = externalMu ? msg : (
          // 7: µ ← H(tr||M, 512)
          shake256.create({ dkLen: CRH_BYTES }).update(tr).update(msg).digest()
        );
        const c = crystals2.NTT.encode(SampleInBall(cTilde));
        const zNtt = z.map((i) => i.slice());
        for (let i = 0; i < L; i++)
          crystals2.NTT.encode(zNtt[i]);
        const wTick1 = [];
        const xof = XOF1282(rho);
        for (let i = 0; i < K; i++) {
          const ct12d = MultiplyNTTs2(crystals2.NTT.encode(polyShiftl(t1[i])), c);
          const Az = newPoly(N2);
          for (let j = 0; j < L; j++) {
            const aij = RejNTTPoly(xof.get(j, i));
            polyAdd2(Az, MultiplyNTTs2(aij, zNtt[j]));
          }
          const wApprox = crystals2.NTT.decode(polySub2(Az, ct12d));
          wTick1.push(polyUseHint(wApprox, h[i]));
        }
        xof.clean();
        const c2 = shake256.create({ dkLen: C_TILDE_BYTES }).update(mu).update(W1Vec.encode(wTick1)).digest();
        for (const t of h) {
          const sum = t.reduce((acc, i) => acc + i, 0);
          if (!(sum <= OMEGA))
            return false;
        }
        for (const t of z)
          if (polyChknorm(t, GAMMA1 - BETA))
            return false;
        return equalBytes(cTilde, c2);
      }
    });
    return Object.freeze({
      info: Object.freeze({ type: "ml-dsa" }),
      internal,
      securityLevel,
      keygen: internal.keygen,
      lengths: internal.lengths,
      getPublicKey: internal.getPublicKey,
      sign: (msg, secretKey, opts3 = {}) => {
        opts3 = validateSigOpts(opts3);
        const M = getMessage(msg, opts3.context);
        const res = internal.sign(M, secretKey, {
          extraEntropy: opts3.extraEntropy,
          externalMu: false
        });
        cleanBytes(M);
        return res;
      },
      verify: (sig, msg, publicKey, opts3 = {}) => {
        opts3 = validateVerOpts(opts3);
        abytesDoc(sig, void 0, "signature");
        return internal.verify(sig, getMessage(msg, opts3.context), publicKey, { externalMu: false });
      },
      prehash: (hash) => {
        checkHash(hash, securityLevel);
        const rawHash = hash;
        return Object.freeze({
          info: Object.freeze({ type: "hashml-dsa" }),
          securityLevel,
          lengths: internal.lengths,
          keygen: internal.keygen,
          getPublicKey: internal.getPublicKey,
          sign: (msg, secretKey, opts3 = {}) => {
            opts3 = validateSigOpts(opts3);
            const M = getMessagePrehash(rawHash, msg, opts3.context);
            const res = internal.sign(M, secretKey, {
              extraEntropy: opts3.extraEntropy,
              externalMu: false
            });
            cleanBytes(M);
            return res;
          },
          verify: (sig, msg, publicKey, opts3 = {}) => {
            opts3 = validateVerOpts(opts3);
            abytesDoc(sig, void 0, "signature");
            return internal.verify(sig, getMessagePrehash(rawHash, msg, opts3.context), publicKey, {
              externalMu: false
            });
          }
        });
      }
    });
  }
  var INTERNAL_SIG_OPT_KEYS, INTERNAL_VER_OPT_KEYS, N2, Q2, ROOT_OF_UNITY2, F2, D, GAMMA2_1, GAMMA2_2, PARAMS2, newPoly, crystals2, id, polyCoder2, polyAdd2, polySub2, polyShiftl, polyChknorm, MultiplyNTTs2, ml_dsa65;
  var init_ml_dsa = __esm({
    "node_modules/@noble/post-quantum/ml-dsa.js"() {
      init_utils2();
      init_sha3();
      init_crystals();
      init_utils3();
      INTERNAL_SIG_OPT_KEYS = /* @__PURE__ */ Object.freeze([
        "extraEntropy",
        "externalMu"
      ]);
      INTERNAL_VER_OPT_KEYS = /* @__PURE__ */ Object.freeze(["externalMu"]);
      N2 = 256;
      Q2 = 8380417;
      ROOT_OF_UNITY2 = 1753;
      F2 = 8347681;
      D = 13;
      GAMMA2_1 = Math.floor((Q2 - 1) / 88) | 0;
      GAMMA2_2 = Math.floor((Q2 - 1) / 32) | 0;
      PARAMS2 = /* @__PURE__ */ (() => Object.freeze({
        2: Object.freeze({
          K: 4,
          L: 4,
          D,
          GAMMA1: 2 ** 17,
          GAMMA2: GAMMA2_1,
          TAU: 39,
          ETA: 2,
          OMEGA: 80
        }),
        3: Object.freeze({
          K: 6,
          L: 5,
          D,
          GAMMA1: 2 ** 19,
          GAMMA2: GAMMA2_2,
          TAU: 49,
          ETA: 4,
          OMEGA: 55
        }),
        5: Object.freeze({
          K: 8,
          L: 7,
          D,
          GAMMA1: 2 ** 19,
          GAMMA2: GAMMA2_2,
          TAU: 60,
          ETA: 2,
          OMEGA: 75
        })
      }))();
      newPoly = (n) => new Int32Array(n);
      crystals2 = /* @__PURE__ */ genCrystals({
        N: N2,
        Q: Q2,
        F: F2,
        ROOT_OF_UNITY: ROOT_OF_UNITY2,
        newPoly,
        isKyber: false,
        brvBits: 8
      });
      id = (n) => n;
      polyCoder2 = (d, compress2 = id, verify = id) => crystals2.bitsCoder(d, {
        encode: (i) => compress2(verify(i)),
        decode: (i) => verify(compress2(i))
      });
      polyAdd2 = (a_, b_) => {
        const a = a_;
        const b = b_;
        for (let i = 0; i < a.length; i++)
          a[i] = crystals2.mod(a[i] + b[i]);
        return a;
      };
      polySub2 = (a_, b_) => {
        const a = a_;
        const b = b_;
        for (let i = 0; i < a.length; i++)
          a[i] = crystals2.mod(a[i] - b[i]);
        return a;
      };
      polyShiftl = (p_) => {
        const p = p_;
        for (let i = 0; i < N2; i++)
          p[i] <<= D;
        return p;
      };
      polyChknorm = (p_, B2) => {
        const p = p_;
        for (let i = 0; i < N2; i++)
          if (Math.abs(crystals2.smod(p[i])) >= B2)
            return true;
        return false;
      };
      MultiplyNTTs2 = (a_, b_) => {
        const a = a_;
        const b = b_;
        const c = newPoly(N2);
        for (let i = 0; i < a.length; i++)
          c[i] = crystals2.mod(a[i] * b[i]);
        return c;
      };
      ml_dsa65 = /* @__PURE__ */ (() => getDilithium({
        ...PARAMS2[3],
        CRH_BYTES: 64,
        TR_BYTES: 64,
        C_TILDE_BYTES: 48,
        XOF128,
        XOF256,
        securityLevel: 192
      }))();
    }
  });

  // node_modules/@noble/hashes/_md.js
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD, SHA256_IV, SHA384_IV, SHA512_IV;
  var init_md = __esm({
    "node_modules/@noble/hashes/_md.js"() {
      init_u64();
      init_utils();
      HashMD = class {
        blockLen;
        outputLen;
        canXOF = false;
        padOffset;
        isLE;
        // For partial updates less than block size
        buffer;
        view;
        finished = false;
        length = 0;
        pos = 0;
        destroyed = false;
        constructor(blockLen, outputLen, padOffset, isLE2) {
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE2;
          this.buffer = new Uint8Array(blockLen);
          this.view = createView(this.buffer);
        }
        update(data) {
          aexists(this);
          abytes(data);
          const { view, buffer, blockLen } = this;
          const len = data.length;
          let processed = false;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = createView(data);
              for (; blockLen <= len - pos; pos += blockLen)
                this.process(dataView, pos);
              processed = true;
              continue;
            }
            buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
              this.process(view, 0);
              this.pos = 0;
              processed = true;
            }
          }
          this.length += data.length;
          if (processed)
            this.roundClean();
          return this;
        }
        digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          const { buffer, view, blockLen, isLE: isLE2 } = this;
          let { pos } = this;
          buffer[pos++] = 128;
          buffer.fill(0, pos);
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            buffer.fill(0);
          }
          setU64FromNum(view, blockLen - 8, this.length * 8, isLE2);
          this.process(view, 0);
          this.roundClean();
          const oview = out === buffer ? view : createView(out);
          const len = this.outputLen;
          const outLen = len / 4;
          const state = this.get();
          if (len % 4 || outLen > state.length)
            throw new Error("invalid outputLen");
          for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE2);
        }
        digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneIntoMeta(to) {
          const { buffer, length, finished, destroyed, pos } = this;
          to.destroyed = destroyed;
          to.finished = finished;
          to.length = length;
          to.pos = pos;
          if (pos)
            to.buffer.set(buffer);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
      };
      SHA256_IV = /* @__PURE__ */ Uint32Array.from([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      SHA384_IV = /* @__PURE__ */ Uint32Array.from([
        3418070365,
        3238371032,
        1654270250,
        914150663,
        2438529370,
        812702999,
        355462360,
        4144912697,
        1731405415,
        4290775857,
        2394180231,
        1750603025,
        3675008525,
        1694076839,
        1203062813,
        3204075428
      ]);
      SHA512_IV = /* @__PURE__ */ Uint32Array.from([
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
      ]);
    }
  });

  // node_modules/@noble/hashes/sha2.js
  var SHA256_K, SHA256_W, SHA2_32B, _SHA256, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA2_64B, _SHA512, _SHA384, sha256, sha512, sha384;
  var init_sha2 = __esm({
    "node_modules/@noble/hashes/sha2.js"() {
      init_md();
      init_u64();
      init_utils();
      SHA256_K = /* @__PURE__ */ Uint32Array.from([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      SHA256_W = /* @__PURE__ */ new Uint32Array(64);
      SHA2_32B = class extends HashMD {
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        // Numeric initializers matter: starting the fields as `undefined` changes
        // V8's field representation and makes sha256 3x slower (measured).
        A = 0;
        B = 0;
        C = 0;
        D = 0;
        E = 0;
        F = 0;
        G = 0;
        H = 0;
        constructor(outputLen, IV) {
          super(64, outputLen, 8, false);
          this.A = IV[0] | 0;
          this.B = IV[1] | 0;
          this.C = IV[2] | 0;
          this.D = IV[3] | 0;
          this.E = IV[4] | 0;
          this.F = IV[5] | 0;
          this.G = IV[6] | 0;
          this.H = IV[7] | 0;
        }
        get() {
          const { A, B: B2, C, D: D2, E, F: F3, G, H } = this;
          return [A, B2, C, D2, E, F3, G, H];
        }
        // prettier-ignore
        set(A, B2, C, D2, E, F3, G, H) {
          this.A = A | 0;
          this.B = B2 | 0;
          this.C = C | 0;
          this.D = D2 | 0;
          this.E = E | 0;
          this.F = F3 | 0;
          this.G = G | 0;
          this.H = H | 0;
        }
        _cloneInto(to) {
          (to ||= new this.constructor()).set(...this.get());
          return this._cloneIntoMeta(to);
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            SHA256_W[i] = view.getUint32(offset, false);
          for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
            const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
            SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
          }
          let { A, B: B2, C, D: D2, E, F: F3, G, H } = this;
          for (let i = 0; i < 64; i++) {
            const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
            const T1 = H + sigma1 + Chi(E, F3, G) + SHA256_K[i] + SHA256_W[i] | 0;
            const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
            const T2 = sigma0 + Maj(A, B2, C) | 0;
            H = G;
            G = F3;
            F3 = E;
            E = D2 + T1 | 0;
            D2 = C;
            C = B2;
            B2 = A;
            A = T1 + T2 | 0;
          }
          A = A + this.A | 0;
          B2 = B2 + this.B | 0;
          C = C + this.C | 0;
          D2 = D2 + this.D | 0;
          E = E + this.E | 0;
          F3 = F3 + this.F | 0;
          G = G + this.G | 0;
          H = H + this.H | 0;
          this.set(A, B2, C, D2, E, F3, G, H);
        }
        roundClean() {
          clean(SHA256_W);
        }
        destroy() {
          this.destroyed = true;
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          clean(this.buffer);
        }
      };
      _SHA256 = class extends SHA2_32B {
        constructor() {
          super(32, SHA256_IV);
        }
      };
      K512 = /* @__PURE__ */ (() => split([
        "0x428a2f98d728ae22",
        "0x7137449123ef65cd",
        "0xb5c0fbcfec4d3b2f",
        "0xe9b5dba58189dbbc",
        "0x3956c25bf348b538",
        "0x59f111f1b605d019",
        "0x923f82a4af194f9b",
        "0xab1c5ed5da6d8118",
        "0xd807aa98a3030242",
        "0x12835b0145706fbe",
        "0x243185be4ee4b28c",
        "0x550c7dc3d5ffb4e2",
        "0x72be5d74f27b896f",
        "0x80deb1fe3b1696b1",
        "0x9bdc06a725c71235",
        "0xc19bf174cf692694",
        "0xe49b69c19ef14ad2",
        "0xefbe4786384f25e3",
        "0x0fc19dc68b8cd5b5",
        "0x240ca1cc77ac9c65",
        "0x2de92c6f592b0275",
        "0x4a7484aa6ea6e483",
        "0x5cb0a9dcbd41fbd4",
        "0x76f988da831153b5",
        "0x983e5152ee66dfab",
        "0xa831c66d2db43210",
        "0xb00327c898fb213f",
        "0xbf597fc7beef0ee4",
        "0xc6e00bf33da88fc2",
        "0xd5a79147930aa725",
        "0x06ca6351e003826f",
        "0x142929670a0e6e70",
        "0x27b70a8546d22ffc",
        "0x2e1b21385c26c926",
        "0x4d2c6dfc5ac42aed",
        "0x53380d139d95b3df",
        "0x650a73548baf63de",
        "0x766a0abb3c77b2a8",
        "0x81c2c92e47edaee6",
        "0x92722c851482353b",
        "0xa2bfe8a14cf10364",
        "0xa81a664bbc423001",
        "0xc24b8b70d0f89791",
        "0xc76c51a30654be30",
        "0xd192e819d6ef5218",
        "0xd69906245565a910",
        "0xf40e35855771202a",
        "0x106aa07032bbd1b8",
        "0x19a4c116b8d2d0c8",
        "0x1e376c085141ab53",
        "0x2748774cdf8eeb99",
        "0x34b0bcb5e19b48a8",
        "0x391c0cb3c5c95a63",
        "0x4ed8aa4ae3418acb",
        "0x5b9cca4f7763e373",
        "0x682e6ff3d6b2b8a3",
        "0x748f82ee5defb2fc",
        "0x78a5636f43172f60",
        "0x84c87814a1f0ab72",
        "0x8cc702081a6439ec",
        "0x90befffa23631e28",
        "0xa4506cebde82bde9",
        "0xbef9a3f7b2c67915",
        "0xc67178f2e372532b",
        "0xca273eceea26619c",
        "0xd186b8c721c0c207",
        "0xeada7dd6cde0eb1e",
        "0xf57d4f7fee6ed178",
        "0x06f067aa72176fba",
        "0x0a637dc5a2c898a6",
        "0x113f9804bef90dae",
        "0x1b710b35131c471b",
        "0x28db77f523047d84",
        "0x32caab7b40c72493",
        "0x3c9ebe0a15c9bebc",
        "0x431d67c49c100d4c",
        "0x4cc5d4becb3e42b6",
        "0x597f299cfc657e2a",
        "0x5fcb6fab3ad6faec",
        "0x6c44198c4a475817"
      ].map((n) => BigInt(n))))();
      SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
      SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
      SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
      SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
      SHA2_64B = class extends HashMD {
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        // h -- high 32 bits, l -- low 32 bits
        // Numeric initializers matter: starting the fields as `undefined` changes
        // V8's field representation and slows hashing down (measured on sha256).
        Ah = 0;
        Al = 0;
        Bh = 0;
        Bl = 0;
        Ch = 0;
        Cl = 0;
        Dh = 0;
        Dl = 0;
        Eh = 0;
        El = 0;
        Fh = 0;
        Fl = 0;
        Gh = 0;
        Gl = 0;
        Hh = 0;
        Hl = 0;
        constructor(outputLen, IV) {
          super(128, outputLen, 16, false);
          this.Ah = IV[0] | 0;
          this.Al = IV[1] | 0;
          this.Bh = IV[2] | 0;
          this.Bl = IV[3] | 0;
          this.Ch = IV[4] | 0;
          this.Cl = IV[5] | 0;
          this.Dh = IV[6] | 0;
          this.Dl = IV[7] | 0;
          this.Eh = IV[8] | 0;
          this.El = IV[9] | 0;
          this.Fh = IV[10] | 0;
          this.Fl = IV[11] | 0;
          this.Gh = IV[12] | 0;
          this.Gl = IV[13] | 0;
          this.Hh = IV[14] | 0;
          this.Hl = IV[15] | 0;
        }
        // prettier-ignore
        get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        // prettier-ignore
        set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
        }
        _cloneInto(to) {
          (to ||= new this.constructor()).set(...this.get());
          return this._cloneIntoMeta(to);
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
          }
          for (let i = 16; i < 80; i++) {
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
            const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
            const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
            const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          for (let i = 0; i < 80; i++) {
            const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
            const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
            const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = add3L(T1l, sigma0l, MAJl);
            Ah = add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
          }
          ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
          clean(SHA512_W_H, SHA512_W_L);
        }
        destroy() {
          this.destroyed = true;
          clean(this.buffer);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
      };
      _SHA512 = class extends SHA2_64B {
        constructor() {
          super(64, SHA512_IV);
        }
      };
      _SHA384 = class extends SHA2_64B {
        constructor() {
          super(48, SHA384_IV);
        }
      };
      sha256 = /* @__PURE__ */ createHasher(
        () => new _SHA256(),
        /* @__PURE__ */ oidNist(1)
      );
      sha512 = /* @__PURE__ */ createHasher(
        () => new _SHA512(),
        /* @__PURE__ */ oidNist(3)
      );
      sha384 = /* @__PURE__ */ createHasher(
        () => new _SHA384(),
        /* @__PURE__ */ oidNist(2)
      );
    }
  });

  // node_modules/@noble/hashes/hmac.js
  var _HMAC, hmac;
  var init_hmac = __esm({
    "node_modules/@noble/hashes/hmac.js"() {
      init_utils();
      _HMAC = class {
        oHash;
        iHash;
        blockLen;
        outputLen;
        canXOF = false;
        finished = false;
        destroyed = false;
        constructor(hash, key) {
          ahash(hash);
          abytes(key, void 0, "key");
          this.iHash = hash.create();
          if (typeof this.iHash.update !== "function")
            throw new Error("expected Hash instance");
          this.blockLen = this.iHash.blockLen;
          this.outputLen = this.iHash.outputLen;
          const blockLen = this.blockLen;
          const pad = new Uint8Array(blockLen);
          pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
          for (let i = 0; i < pad.length; i++)
            pad[i] ^= 54;
          this.iHash.update(pad);
          this.oHash = hash.create();
          for (let i = 0; i < pad.length; i++)
            pad[i] ^= 54 ^ 92;
          this.oHash.update(pad);
          clean(pad);
        }
        update(buf) {
          aexists(this);
          this.iHash.update(buf);
          return this;
        }
        digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          const buf = out.subarray(0, this.outputLen);
          this.iHash.digestInto(buf);
          this.oHash.update(buf);
          this.oHash.digestInto(buf);
          this.destroy();
        }
        digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
        }
        _cloneInto(to) {
          to ||= Object.create(Object.getPrototypeOf(this), {});
          const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.canXOF = canXOF;
          to.oHash = oHash._cloneInto(to.oHash);
          to.iHash = iHash._cloneInto(to.iHash);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
        destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
        }
      };
      hmac = /* @__PURE__ */ (() => {
        const hmac_ = ((hash, key, message) => new _HMAC(hash, key).update(message).digest());
        hmac_.create = (hash, key) => new _HMAC(hash, key);
        return hmac_;
      })();
    }
  });

  // node_modules/@noble/hashes/hkdf.js
  function expand(hash, prk, info, length = 32, _recycled) {
    ahash(hash);
    anumber(length, "length");
    abytes(prk, void 0, "prk");
    const olen = hash.outputLen;
    if (prk.length < olen)
      throw new Error('"prk" must be at least HashLen octets');
    if (length > 255 * olen)
      throw new Error("Length must be <= 255*HashLen");
    const blocks = Math.ceil(length / olen);
    if (info === void 0)
      info = EMPTY_BUFFER;
    else
      abytes(info, void 0, "info");
    if (!blocks) {
      if (_recycled)
        clean(prk);
      return new Uint8Array();
    }
    const okm = _recycled && blocks === 1 ? prk : new Uint8Array(blocks * olen);
    const { iHash, oHash } = hmac.create(hash, prk);
    const T = _recycled ? prk : new Uint8Array(olen);
    const worker = blocks > 1 ? _recycled?.iHash || hash.create() : void 0;
    for (let counter = 0; counter < blocks - 1; counter++) {
      HKDF_COUNTER[0] = counter + 1;
      const iWork = iHash._cloneInto(worker);
      if (counter)
        iWork.update(T);
      iWork.update(info).update(HKDF_COUNTER).digestInto(T);
      oHash._cloneInto(worker).update(T).digestInto(T);
      okm.set(T, olen * counter);
    }
    HKDF_COUNTER[0] = blocks;
    if (blocks > 1)
      iHash.update(T);
    iHash.update(info).update(HKDF_COUNTER).digestInto(T);
    oHash.update(T).digestInto(T);
    okm.set(T, olen * (blocks - 1));
    iHash.destroy();
    oHash.destroy();
    worker?.destroy();
    if (T !== okm)
      clean(T);
    clean(HKDF_COUNTER);
    if (length === okm.length)
      return okm;
    const res = okm.slice(0, length);
    clean(okm);
    return res;
  }
  var HKDF_COUNTER, EMPTY_BUFFER, hkdf;
  var init_hkdf = __esm({
    "node_modules/@noble/hashes/hkdf.js"() {
      init_hmac();
      init_utils();
      HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
      EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
      hkdf = (hash, ikm, salt, info, length) => {
        ahash(hash);
        if (salt === void 0)
          salt = new Uint8Array(hash.outputLen);
        const HMAC = hmac.create(hash, salt).update(ikm);
        return expand(hash, HMAC.digest(), info, length, HMAC);
      };
    }
  });

  // pqc-entry.js
  var require_pqc_entry = __commonJS({
    "pqc-entry.js"(exports, module) {
      init_ml_kem();
      init_ml_dsa();
      init_sha2();
      init_hkdf();
      var noblePqc = {
        ml_kem768,
        ml_dsa65,
        sha256,
        sha384,
        sha512,
        hkdf
      };
      if (typeof window !== "undefined") {
        window.noblePqc = noblePqc;
      }
      if (typeof globalThis !== "undefined") {
        globalThis.noblePqc = noblePqc;
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = noblePqc;
      }
    }
  });
  return require_pqc_entry();
})();
/*! Bundled license information:

@noble/curves/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/post-quantum/utils.js:
@noble/post-quantum/_crystals.js:
@noble/post-quantum/ml-kem.js:
@noble/post-quantum/ml-dsa.js:
  (*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) *)
*/
