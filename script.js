const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const urls = [
    'https://cpaoffer221.blogspot.com/2024/10/amazoncom-gift-card-balance-reload.html',
    'https://krishihelp660.blogspot.com/2022/04/tub-data-vegetable-cultivation-method.html',
 
    'https://krishihelp660.blogspot.com/',
    'https://krishihelp660.blogspot.com/2022/04/toba-karla-cultivation-method.html',
    'https://noohapou.com/4/8153308',
];

const referers = [
    'https://www.google.com/',
    'https://www.facebook.com/',
    'https://www.twitter.com/',
    // Add more referers...
];

const proxyUrl = 'gw.dataimpulse.com';
const proxyUsername = '00e2f57a313920c676ce';
const proxyPassword = 'adc63cf51060b592';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateHumanInteraction(page) {
    console.log('Scrolling top to bottom and back up');

    // Scroll from top to bottom
    let scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    let scrollStep = Math.ceil(scrollHeight / 5); // Divide scrolling into 5 steps

    for (let i = 0; i < 5; i++) {
        await page.evaluate((step) => {
            window.scrollBy(0, step);
        }, scrollStep);
        await page.waitForTimeout(getRandomInt(1000, 3000)); // Random scroll delay
    }

    // Scroll from bottom to top
    for (let i = 0; i < 5; i++) {
        await page.evaluate((step) => {
            window.scrollBy(0, -step);
        }, scrollStep);
        await page.waitForTimeout(getRandomInt(1000, 3000)); // Random scroll delay
    }

    const links = await page.$$('a');
    if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * links.length)];
        try {
            const linkText = await page.evaluate(el => el.textContent, randomLink);
            console.log(`Clicking on link: ${linkText}`);
            await randomLink.click();
        } catch (err) {
            console.log('Link not clickable:', err);
        }
    }

    // Random wait time to simulate more human interaction
    await page.waitForTimeout(getRandomInt(6000, 9000));

    // Improved ad interaction and click simulation
    const iframes = await page.$$('iframe');
    if (iframes.length > 0) {
        console.log('Found iframes, interacting with potential ads...');
        for (const iframe of iframes) {
            try {
                const frame = await iframe.contentFrame();
                if (frame) {
                    // Scroll inside the iframe
                    await frame.evaluate(() => {
                        window.scrollBy(0, window.innerHeight / 2);
                    });
                    console.log('Scrolled inside iframe');

                    // Find clickable ads inside the iframe
                    const ads = await frame.$$('a, ins');
                    if (ads.length > 0) {
                        const ad = ads[Math.floor(Math.random() * ads.length)];
                        await ad.click();
                        console.log('Clicked on an ad inside iframe');

                        // Wait for the ad page to fully load inside the iframe
                        await frame.waitForNavigation({ waitUntil: 'load', timeout: 60000 });
                        console.log('Ad page fully loaded, waiting for 60 seconds on the ad page...');
                        
                        // Wait for 60 seconds after clicking on the ad
                        await page.waitForTimeout(60000);

                        break;  // Exit after interacting with one ad
                    }
                }
            } catch (err) {
                console.log('Error interacting with iframe:', err);
            }
        }
    } else {
        console.log('No iframes found, checking for ads on the main page...');

        // Check for ads directly on the page
        const adsOnPage = await page.$$('a, ins');
        if (adsOnPage.length > 0) {
            const adOnPage = adsOnPage[Math.floor(Math.random() * adsOnPage.length)];
            try {
                await adOnPage.click();
                console.log('Clicked on an ad on the main page');

                // Wait for the ad page to fully load
                await page.waitForNavigation({ waitUntil: 'load', timeout: 60000 });
                console.log('Ad page fully loaded, waiting for 60 seconds on the ad page...');
                
                // Wait for 60 seconds after clicking on the ad
                await page.waitForTimeout(60000);
            } catch (err) {
                console.log('Error clicking on ad on the main page:', err);
            }
        }
    }
}

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

    console.log(`Using referer: ${referer}`);
    console.log(`Browser fingerprint: User Agent: ${userAgent}, Viewport: ${JSON.stringify(viewport)}`);

    try {
        await page.authenticate({ username: proxyUsername, password: proxyPassword });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`Visiting URL: ${url}`);
        await page.waitForTimeout(60000); // Stay on the page for 60 seconds

        await simulateHumanInteraction(page); // Simulate human interaction

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        console.log('Closing page');
        await page.close();
    }
}

(async () => {
    while (true) {
        for (const url of urls) {
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

                await visitAndInteract(browser, url);
                await browser.close();
            } catch (err) {
                console.error('Error during interaction:', err);
            }

            await new Promise(resolve => setTimeout(resolve, getRandomInt(5000, 10000))); // Random delay before next URL visit
        }
    }
})();
