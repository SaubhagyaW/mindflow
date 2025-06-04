import https from 'https';
import http from 'http';

const pages = [
    'https://www.mind-flow.ai',
    'https://www.mind-flow.ai/services',
    'https://www.mind-flow.ai/terms',
    'https://www.mind-flow.ai/privacy',
    'https://www.mind-flow.ai/return-policy',
    'https://www.mind-flow.ai/contact',
    'https://www.mind-flow.ai/pricing',
    'https://www.mind-flow.ai/about'
];

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;

        const request = client.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    html: data
                });
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

function extractCanonical(html) {
    // Look for canonical link in HTML
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
    if (canonicalMatch) {
        return canonicalMatch[1];
    }

    // Also check for alternate format
    const altMatch = html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
    if (altMatch) {
        return altMatch[1];
    }

    return 'NOT FOUND';
}

async function checkCanonicals() {
    console.log('🔍 CHECKING CANONICAL URLs');
    console.log('===========================\n');

    for (const url of pages) {
        try {
            console.log(`Checking: ${url}`);

            const result = await fetchPage(url);
            const canonical = extractCanonical(result.html);

            console.log(`  Status: ${result.statusCode}`);
            console.log(`  Canonical: ${canonical}`);

            // Check if canonical URL is accessible
            if (canonical && canonical !== 'NOT FOUND' && canonical.startsWith('http')) {
                try {
                    const canonicalResult = await fetchPage(canonical);
                    console.log(`  Canonical Status: ${canonicalResult.statusCode}`);

                    if (canonicalResult.statusCode === 301 || canonicalResult.statusCode === 302) {
                        const location = canonicalResult.headers.location;
                        console.log(`  🔥 REDIRECT ISSUE: Canonical redirects to ${location}`);
                    } else if (canonicalResult.statusCode === 200) {
                        console.log(`  ✅ OK: Canonical returns 200`);
                    } else {
                        console.log(`  ⚠️  WARNING: Canonical returns ${canonicalResult.statusCode}`);
                    }
                } catch (canonicalError) {
                    console.log(`  ❌ ERROR: Cannot check canonical URL - ${canonicalError.message}`);
                }
            }

            // Check if page URL matches canonical
            if (url === canonical) {
                console.log(`  ✅ MATCH: Page URL equals canonical`);
            } else {
                console.log(`  ❌ MISMATCH: Page URL ≠ canonical`);
            }

            console.log('');

        } catch (error) {
            console.log(`  ❌ ERROR: ${error.message}\n`);
        }
    }

    console.log('\n🎯 SUMMARY');
    console.log('===========');
    console.log('Look for:');
    console.log('✅ "OK: Canonical returns 200" - Good');
    console.log('❌ "REDIRECT ISSUE: Canonical redirects" - Needs fix');
    console.log('❌ "MISMATCH: Page URL ≠ canonical" - Needs fix');
}

// Alternative version using curl if Node.js fetch doesn't work
function generateCurlCommands() {
    console.log('\n🛠️  ALTERNATIVE: Use these curl commands to check manually:\n');

    pages.forEach(url => {
        console.log(`# Check ${url}`);
        console.log(`curl -s "${url}" | grep -i 'rel="canonical"'`);
        console.log(`curl -I "${url}" | head -5`);
        console.log('');
    });

    console.log('# Check if canonical URLs redirect:');
    console.log('curl -I "https://mind-flow.ai/"');
    console.log('curl -I "https://www.mind-flow.ai/"');
}

// Run the checker
checkCanonicals().catch(error => {
    console.error('Script failed:', error);
    console.log('\n📝 If the script fails, try the curl commands below:');
    generateCurlCommands();
});

// Also output curl commands for manual checking
generateCurlCommands();
