
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const urls = [
    'https://krishihelp660.blogspot.com/2022/04/tub-data-vegetable-cultivation-method.html',
    'https://krishihelp660.blogspot.com/',
	'https://krishihelp660.blogspot.com/',
    // Add more URLs here...
];

const referers = [
    'https://www.google.com/',
    'https://www.facebook.com/',
    // Add more referers here...
];

const proxyUrl = 'gw.dataimpulse.com';
const proxyUsername = '00e2f57a313920c676ce';
const proxyPassword = 'adc63cf51060b592';

// Random integer generator
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulate human-like scrolling behavior (top to bottom and back)
async function simulateScroll(page) {
    console.log('Simulating scroll...');
    await page.evaluate(async () => {
        let scrollHeight = document.body.scrollHeight;
        let viewPortHeight = window.innerHeight;
        
        // Scroll from top to bottom
        for (let i = 0; i < scrollHeight; i += viewPortHeight) {
            window.scrollBy(0, viewPortHeight);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between scrolls
        }

        // Scroll from bottom back to top
        for (let i = scrollHeight; i > 0; i -= viewPortHeight) {
            window.scrollBy(0, -viewPortHeight);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
    await page.waitForTimeout(60000); // Stay on the page for 60 seconds
}

// Handle interactions with iframes (ads)
async function handleAds(page) {
    try {
        console.log('Looking for iframes (ads)...');
        const iframes = await page.$$('iframe');
        
        for (const iframe of iframes) {
            try {
                const frame = await iframe.contentFrame();
                if (frame) {
                    console.log('Interacting with ad inside iframe...');
                    await frame.evaluate(() => window.scrollBy(0, window.innerHeight));
                    const adLinks = await frame.$$('a');
                    
                    if (adLinks.length > 0) {
                        const ad = adLinks[Math.floor(Math.random() * adLinks.length)];
                        await ad.click();
                        console.log('Ad clicked, waiting on ad page for 60 seconds...');
                        await page.waitForTimeout(60000); // Stay on the ad page for 60 seconds
                    }
                }
            } catch (err) {
                console.log('Error interacting with iframe ad:', err);
            }
        }
    } catch (error) {
        console.error('Error while handling ads:', error);
    }
}

// Visit URL and interact with the page
async function visitAndInteract(browser, url) {
    const page = await browser.newPage();
    const userAgent = randomUseragent.getRandom();
    const referer = referers[Math.floor(Math.random() * referers.length)];
    
    const viewport = {
        width: getRandomInt(1200, 1920),
        height: getRandomInt(800, 1080),
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
    };

    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({ referer });
    await page.setViewport(viewport);

    console.log(`Visiting: ${url} with referer: ${referer}`);

    try {
        await page.authenticate({ username: proxyUsername, password: proxyPassword });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        await simulateScroll(page); // Scroll through the page
        await handleAds(page);      // Handle ad interactions (iframe)
    } catch (error) {
        console.error(`Error visiting ${url}:`, error);
    } finally {
        await page.close();
    }
}

// Main process: launching the browser and visiting URLs
(async () => {
    while (true) {
        try {
            console.log(`Launching browser with proxy: ${proxyUrl}`);
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    `--proxy-server=${proxyUrl}`,
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                ],
                ignoreHTTPSErrors: true,
            });

            for (const url of urls) {
                await visitAndInteract(browser, url);
                await new Promise(resolve => setTimeout(resolve, getRandomInt(5000, 10000))); // Delay between visits
            }

            await browser.close();
        } catch (err) {
            console.error('Error during browser launch or interaction:', err);
        }

        await new Promise(resolve => setTimeout(resolve, getRandomInt(10000, 15000))); // Pause between full cycles
    }
})();
