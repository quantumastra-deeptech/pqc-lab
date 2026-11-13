/**
 * CLI Test Runner for CryptoShift Lab
 * Runs all cryptographic, architectural, policy, and CBOM tests in Node.js.
 */

const TestSuite = require('../js/test-suite.js');

async function main() {
  console.log('====================================================');
  console.log(' CRYPTOSHIFT LAB — AUTOMATED CRYPTO & SYSTEM TESTS');
  console.log('====================================================\n');

  const report = await TestSuite.runAllTests();

  report.results.forEach((r, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const status = r.passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    const timing = `(${r.durationMs.toFixed(1)} ms)`;
    console.log(`${num}. ${status} ${r.name} ${timing}`);
    if (r.passed) {
      console.log(`    \x1b[90m→ ${r.message}\x1b[0m`);
    } else {
      console.log(`    \x1b[31mError: ${r.error}\x1b[0m`);
    }
  });

  console.log('\n----------------------------------------------------');
  console.log(`Summary: ${report.passedCount}/${report.totalTests} tests passed in ${report.totalDurationMs.toFixed(1)} ms`);
  console.log('----------------------------------------------------');

  if (!report.allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
