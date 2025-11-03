const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

// Simple HTTP server to serve static files
function createServer(port) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url);
            let pathname = path.join(__dirname, parsedUrl.pathname);

            console.log('HTTP REQUEST:', req.url);

            // Default to index.html
            if (pathname.endsWith('/')) {
                pathname = path.join(pathname, 'index.html');
            }

            // Get file extension
            const ext = path.parse(pathname).ext || '.html';
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            };

            fs.exists(pathname, (exist) => {
                if (!exist) {
                    console.log('404:', pathname);
                    res.statusCode = 404;
                    res.end(`File ${pathname} not found!`);
                    return;
                }

                fs.readFile(pathname, (err, data) => {
                    if (err) {
                        console.log('500:', err);
                        res.statusCode = 500;
                        res.end(`Error getting the file: ${err}.`);
                    } else {
                        res.setHeader('Content-type', mimeTypes[ext] || 'text/plain');
                        console.log('200:', pathname, 'as', mimeTypes[ext]);
                        res.end(data);
                    }
                });
            });
        });

        server.listen(port, () => {
            console.log(`HTTP server running on http://localhost:${port}`);
            resolve(server);
        });

        server.on('error', reject);
    });
}

async function runTests() {
    console.log('Starting test suite...\n');

    // Start HTTP server
    const port = 8765;
    const server = await createServer(port);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen for console messages from the page
    const testResults = [];
    page.on('console', msg => {
        const text = msg.text();
        console.log('PAGE LOG:', text);
        if (text.startsWith('TEST_RESULT:')) {
            const result = JSON.parse(text.replace('TEST_RESULT:', ''));
            testResults.push(result);
        }
    });

    // Listen for page errors
    page.on('pageerror', error => {
        console.error('PAGE ERROR:', error.message);
        console.error('Stack:', error.stack);
    });

    // Navigate to test suite over HTTP
    const testPath = `http://localhost:${port}/test-suite.html`;
    console.log('Navigating to', testPath);
    await page.goto(testPath, { waitUntil: 'networkidle0' });

    console.log('Page loaded, waiting for modules...');

    // Wait for modules to load
    try {
        await page.waitForFunction(() => {
            return window.modulesLoaded === true;
        }, { timeout: 10000 });
        console.log('Modules loaded, starting tests...\n');
    } catch (err) {
        console.error('Timeout waiting for modules to load');
        const debugInfo = await page.evaluate(() => {
            return {
                modulesLoaded: window.modulesLoaded,
                selectCellDefined: typeof window.selectCell,
                mainDefined: typeof window.main
            };
        });
        console.log('Debug info:', debugInfo);
        throw err;
    }

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

    // Wait for tests to complete (increased timeout for tests with long waits)
    await page.waitForFunction(() => {
        const summary = document.getElementById('testSummary');
        return summary && summary.textContent.includes('Tests completed');
    }, { timeout: 60000 });

    // Get final summary
    const summary = await page.evaluate(() => {
        const summaryEl = document.getElementById('testSummary');
        return summaryEl ? summaryEl.textContent : '';
    });

    await browser.close();

    // Close HTTP server
    server.close();

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
