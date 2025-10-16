const puppeteer = require('puppeteer');
const path = require('path');

async function runTests() {
    console.log('Starting test suite...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen for console messages from the page
    const testResults = [];
    page.on('console', msg => {
        const text = msg.text();
        if (text.startsWith('TEST_RESULT:')) {
            const result = JSON.parse(text.replace('TEST_RESULT:', ''));
            testResults.push(result);
        }
    });

    // Navigate to test suite
    const testPath = 'file://' + path.resolve(__dirname, 'test-suite.html');
    await page.goto(testPath, { waitUntil: 'networkidle0' });

    // Run tests
    await page.evaluate(() => {
        // Override test result logging to send to console
        const originalPush = testResults.push;
        testResults.push = function(result) {
            console.log('TEST_RESULT:' + JSON.stringify(result));
            return originalPush.call(this, result);
        };

        // Run all tests
        return runAllTests();
    });

    // Wait for tests to complete
    await page.waitForFunction(() => {
        const summary = document.getElementById('testSummary');
        return summary && summary.textContent.includes('Tests completed');
    }, { timeout: 30000 });

    // Get final summary
    const summary = await page.evaluate(() => {
        const summaryEl = document.getElementById('testSummary');
        return summaryEl ? summaryEl.textContent : '';
    });

    await browser.close();

    // Print results
    console.log('='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    testResults.forEach(result => {
        if (result.passed) {
            console.log(`✓ ${result.name}`);
            passed++;
        } else {
            console.log(`✗ ${result.name}`);
            console.log(`  Error: ${result.error}`);
            failed++;
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Error running tests:', err);
    process.exit(1);
});
