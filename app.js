const puppeteer = require('puppeteer-core');
const fs = require('fs');

autoComment('https://www.facebook.com/');

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function autoComment(url) {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            "--no-sandbox",
            "--disable-gpu",
        ],
        channel: "chrome"
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, {
        timeout: 0,
        waitUntil: 'networkidle0',
    });

    //   wait
    await page.waitForSelector('input#email');
    await page.type('input#email', 'justinlaurenso0@gmail.com', { delay: 100 });
    await page.waitForSelector('input#pass');
    await page.type('input#pass', 'testing123', { delay: 100 });
    await page.keyboard.press('Enter');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await page.goto("https://www.facebook.com/groups/106641399183172/", {
        timeout: 0,
        waitUntil: 'networkidle0',
    });

    while (true) {
        // Wait for the new post to appear
        await page.waitForSelector('div[role="article"]');

        // Check if the newest post has an image
        const latestPostImage = await page.evaluate(() => {
            const postElement = document.querySelector('div[role="article"]');
            const imageElement = postElement.querySelector('img');
            return imageElement ? imageElement.src : null;
        });

        if (latestPostImage) {
            // If the newest post has an image, comment on it
            const comment = "This is an automated comment using Puppeteer!";
            await page.waitForSelector('div[role="textbox"]');
            await page.type('div[role="textbox"]', comment, { delay: 100 });

            // Press Enter to post the comment
            await page.keyboard.press('Enter');

            // Wait for a short time to ensure the comment is posted successfully
            await delay(2000);
            console.log("Comment posted successfully");
            break; // Exit the loop after posting the comment
        } else {
            // If the newest post doesn't have an image, refresh the page
            await page.reload({ waitUntil: 'networkidle0' });
            console.log("No image found. Refreshing the page...");
        }
    }
}