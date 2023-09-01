// modules
const puppeteer = require('puppeteer-core');
const configAccount = require('./config.json');
const { spawn } = require('child_process');
const commentedFile = require('./commented.json');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// config
const commentedPosts = new Set(commentedFile);
const key = process.argv[2];

// helper
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeCommentedPosts() {
    try {
        await fs.promises.writeFile(
            './commented.json',
            JSON.stringify([...commentedPosts]),
            'utf8'
        );
    } catch (error) {
        console.error(
            'Terjadi kesalahan saat menulis ke commentedPosts.json:',
            error
        );
    }
}

function compareUrlsUntilJpg(url1, url2) {
    const urlObj1 = new URL(url1);
    const urlObj2 = new URL(url2);

    const path1 = urlObj1.pathname;
    const path2 = urlObj2.pathname;

    // Compare the paths until .jpg
    if (path1.includes('.jpg') && path2.includes('.jpg')) {
        return path1.substring(0, path1.indexOf('.jpg')) === path2.substring(0, path2.indexOf('.jpg'));
    }

    return false;
}

function formatGroup(url) {
    // Remove any query parameters and fragments
    var baseURL = url.split("?")[0].split("#")[0];

    // Remove the trailing slash if present
    if (baseURL.endsWith("/")) {
        baseURL = baseURL.slice(0, -1);
    }

    return baseURL;
}

async function extractItems() {
    const feedElements = document.querySelectorAll('div[role="feed"] > .x1yztbdb');
    const newPosts = [];

    for (let i = 0; i < 30; i++) {
        if (feedElements[i]) {
            const checkImage = feedElements && feedElements[i].querySelector('img.x1ey2m1c');

            const post = {
                image: null,
            };

            if (checkImage) {
                const checkAdmin = feedElements[i].querySelector(".x1j85h84");
                if (checkAdmin && (checkAdmin.innerHTML === 'Admin' || checkAdmin.innerHTML === 'Moderator')) {
                    const result = checkImage ? checkImage.src : null
                    if (result !== null) {
                        post.image = result
                        feedElements[i].classList.add(`item-0`);
                        newPosts.push(post);
                        i = 999;
                        break;
                    }
                }
            }
        }
    }
    return newPosts;
}


async function scrapeItems(page, extractItems, itemCount, scrollDelay = 100) {
    let itemsWithImages = [];

    try {
        let previousHeight;
        let checkedPosts = 0;

        while (checkedPosts < itemCount) {
            const items = await page.evaluate(extractItems);

            for (const item of items) {
                if (item.image !== null) {
                    itemsWithImages.push(item.image);
                    checkedPosts = 999;
                    break;
                }
            }

            if (checkedPosts < itemCount) {
                previousHeight = await page.evaluate('document.body.scrollHeight');
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
                await page.waitForTimeout(scrollDelay);

                checkedPosts++;
                if (checkedPosts === itemCount) {
                    break;
                }
            }
        }
    } catch (e) { }

    return itemsWithImages;
}

// main func
async function mainBot() {
    try {
        // config puppeteer | just ignore it
        console.log('Launch browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-gpu', "--disable-notifications"],
            channel: 'chrome',
            executablePath: '/usr/bin/chromium-browser',
        });

        // setup browser | just ignore it
        console.log('Go to facebook...');
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36');
        await page.goto('https://web.facebook.com/', {
            timeout: 0,
            waitUntil: 'networkidle2',
        });

        // login process
        await page.waitForSelector('input#email');
        await page.type('input#email', configAccount.account.email, { delay: 0 });
        await page.waitForSelector('input#pass');
        await page.type('input#pass', configAccount.account.password, {
            delay: 0,
        });
        await page.keyboard.press('Enter');

        // waiting page load
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Login success...');

        await page.goto(formatGroup(configAccount.group_url) + '?sorting_setting=CHRONOLOGICAL',
            {
                timeout: 0,
                waitUntil: 'networkidle2',
            }
        );
        console.log('Go to group url : ', formatGroup(configAccount.group_url));

        // infinite loop
        // while (true) {
        // Wait for the new post to appear
        // await page.waitForSelector('div[role="feed"]');
        while (true) {
            const feedVisible = await page.evaluate(() => {
                const feed = document.querySelector('div[role="feed"]');
                return feed && window.getComputedStyle(feed).display !== 'none';
            });

            if (feedVisible) {
                break; // Exit the loop if the feed is visible  
            }

            await page.reload({ waitUntil: 'networkidle2' });
            await delay(3000); // Wait for 3 second before checking again
        }

        while (true) {
            console.log("Checking post...")
            const items = await scrapeItems(page, extractItems, 30);

            let textBoxs = [];
            for (const item of items) {
                const found = await page.evaluate((item) => {
                    const feedElements = document.querySelectorAll('div[role="feed"] > .x1yztbdb');

                    for (let i = 0; i < feedElements.length; i++) {
                        if (feedElements[i]) {
                            const imageSelector = `img.x1ey2m1c[src="${item}"]`;
                            const foundImage = feedElements[i].querySelector(imageSelector);

                            if (foundImage) {
                                let commentBox = feedElements[i].querySelector("div[role='textbox']");
                                if (commentBox) {
                                    return feedElements[i].innerHTML;
                                } else {
                                    return null
                                }
                            }
                        }
                    }

                    return null;
                }, item, configAccount.comment);

                textBoxs.push(found);
            }

            // run function to comment on the post
            await commentOnPosts(page, textBoxs).then(async () => {
                console.log("Refreshing...")
                await delay(1000);
                await page.reload({ waitUntil: 'networkidle2' })
            });
        }
    } catch (error) {
        console.error('something error : ', error);
    }
}

async function commentOnPosts(page, textBoxs) {
    const commentPromises = [];

    for (let i = 0; i < textBoxs.length; i++) {
        const textBox = textBoxs[i];

        if (textBox !== null) {
            const textBoxString = textBox.toString();
            const dom = new JSDOM(textBoxString);
            const document = dom.window.document;

            const imgElements = document.querySelectorAll('img.x1ey2m1c');
            let imgSource = imgElements[0].getAttribute('src');

            // check img src
            if (imgSource) {
                // jika post belum pernah di komentari
                if (![...commentedPosts].some(item => compareUrlsUntilJpg(item, imgSource))) {
                    const commentPromise = (async () => {
                        await page.type(`.item-${i} div[role='textbox']`, configAccount.comment);
                        await page.keyboard.press("Enter");

                        commentedPosts.add(imgSource);
                        await writeCommentedPosts();
                        console.log("Postingan berhasil dikomentari");
                    })();

                    commentPromises.push(commentPromise);
                } else {
                    console.log('Postingan sudah dikomentari. Melewati...');
                }
            }
        }
        else {
            console.log("Tidak menemukan textbox untuk dikomentari");
        }
        // await delay(1000);
    }

    return Promise.all(commentPromises);
}

// run main function
(async () => {
    if (
        Object.values(configAccount.account).some((value) => value == null) ||
        configAccount.comment == null ||
        configAccount.group_url == null
    ) {
        console.log(`please setup the account`);
        // Run the second script using child_process.spawn
        spawn('node', ['config/config.js'], {
            stdio: 'inherit',
        });
    } else {
        // get key from api
        try {
            const response = await axios.get(
                'https://api-key-bot.vercel.app/api/key'
            );
            const data = await response.data;

            // compare
            const isValid = await bcrypt.compare(key, data.key);

            if (!isValid) {
                throw new Error('kode akses salah!');
            }

            mainBot();
        } catch (error) {
            console.log('error: ', error.message);
        }
    }
})();
