const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const urls = [
    'https://krishihelp660.blogspot.com/2022/04/dragon-fruit-cultivation-method-in-tub.html',
    'https://krishihelp660.blogspot.com/',
    'https://krishihelp660.blogspot.com/2022/04/tub-data-vegetable-cultivation-method.html',
   
];

const referers = [
    'https://www.google.com/',
    'https://www.facebook.com/',
    'https://www.twitter.com/',
    'https://www.linkedin.com/',
    'https://www.instagram.com/',
    'https://www.reddit.com/',
    'https://www.pinterest.com/',
    'https://www.tumblr.com/',
    'https://www.quora.com/',
    'https://www.medium.com/',
    'https://www.snapchat.com/',
    'https://www.whatsapp.com/',
    'https://www.weibo.com/',
    'https://www.qq.com/',
    'https://www.taobao.com/',
    'https://www.tiktok.com/',
    'https://www.telegram.org/',
    'https://www.vk.com/',
    'https://www.odnoklassniki.ru/',
    'https://www.wechat.com/',
    'https://www.line.me/',
    'https://www.skype.com/',
    'https://www.slack.com/',
    'https://www.github.com/',
    'https://www.stackoverflow.com/',
    'https://www.bitbucket.org/',
    'https://www.dribbble.com/',
    'https://www.behance.net/',
    'https://www.flickr.com/',
    'https://www.deviantart.com/',
    'https://www.vimeo.com/',
    'https://www.dailymotion.com/',
    'https://www.twitch.tv/',
    'https://www.mixer.com/',
    'https://www.soundcloud.com/',
    'https://www.spotify.com/',
    'https://www.apple.com/',
    'https://www.amazon.com/',
    'https://www.ebay.com/',
    'https://www.alibaba.com/',
    'https://www.aliexpress.com/',
    'https://www.walmart.com/',
    'https://www.target.com/',
    'https://www.bestbuy.com/',
    'https://www.homedepot.com/',
    'https://www.lowes.com/',
    'https://www.costco.com/',
    'https://www.samsclub.com/',
    'https://www.newegg.com/',
    'https://www.wayfair.com/'
];

const proxyUrl = 'gw.dataimpulse.com';
const proxyUsername = '00e2f57a313920c676ce';
const proxyPassword = 'adc63cf51060b592';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulate scrolling behavior
async function simulateScroll(page) {
    console.log('Scrolling the page from top to bottom and back up');
    await page.evaluate(async () => {
        // Scroll to the bottom
        for (let i = 0; i < document.body.scrollHeight; i += window.innerHeight) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(resolve => setTimeout(resolve, 500)); // Short delay between scrolls
        }
        // Scroll back to the top
        for (let i = document.body.scrollHeight; i > 0; i -= window.innerHeight) {
            window.scrollBy(0, -window.innerHeight);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    });
    await page.waitForTimeout(60000); // Wait for 60 seconds on the page
}

// Handle iframe ads
async function handleAds(page) {
    const iframes = await page.$$('iframe');
    for (const iframe of iframes) {
        try {
            const frame = await iframe.contentFrame();
            if (frame) {
                console.log('Found iframe, attempting to click an ad inside');
                await frame.evaluate(() => window.scrollBy(0, window.innerHeight));
                const adLinks = await frame.$$('a');
                if (adLinks.length > 0) {
                    const ad = adLinks[Math.floor(Math.random() * adLinks.length)];
                    await ad.click();
                    console.log('Ad clicked, waiting on ad page');
                    await page.waitForTimeout(60000); // Stay on the ad page for 60 seconds
                }
            }
        } catch (err) {
            console.log('Error interacting with iframe ad:', err);
        }
    }
}

// Main interaction logic
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

        await simulateScroll(page); // Scroll page and wait for ads to load
        await handleAds(page); // Handle ad interactions
    } catch (error) {
        console.error('Error during page visit:', error);
    } finally {
        await page.close();
    }
}

// Launch the browser and cycle through the URLs
(async () => {
    while (true) {
        for (const url of urls) {
            try {
                console.log(`Launching browser with proxy: ${
