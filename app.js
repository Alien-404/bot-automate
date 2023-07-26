const puppeteer = require('puppeteer-core');
const fs = require('fs');

const postedComments = new Set();

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

    // // Wait for the comment input field to appear and type the comment
    // const comment = "This is an automated comment using Puppeteer!";
    // await page.waitForSelector('div[role="textbox"]');
    // await page.type('div[role="textbox"]', comment, { delay: 100 });

    // // Press Enter to post the comment
    // await page.keyboard.press('Enter');

    // // Wait for a short time to ensure the comment is posted successfully
    // await delay(2000);
    // console.log("comment posted successfully")

    // await page.close();
    // await browser.close();

    while (true) {
        // Wait for the new post to appear
        await page.waitForSelector('div[role="article"]');

        // Get the unique identifier for the newest post
        const latestPostIdentifier = await page.evaluate(() => {
            const postElement = document.querySelector('div[role="article"]');
            const textElement = postElement ? postElement.innerText : '';
            const imageElement = postElement.querySelector('img');
            const imageSrc = imageElement ? imageElement.src : '';
            return textElement + imageSrc;
        });

        if (latestPostIdentifier && !postedComments.has(latestPostIdentifier)) {
            // If the unique identifier is not in the posted comments set, comment on the post
            const comment = "This is an automated comment using Puppeteer!";
            await page.waitForSelector('div[role="textbox"]');
            await page.type('div[role="textbox"]', comment, { delay: 100 });

            // Press Enter to post the comment
            await page.keyboard.press('Enter');

            // Wait for a short time to ensure the comment is posted successfully
            await delay(2000);
            console.log("Comment posted successfully");
            postedComments.add(latestPostIdentifier); // Add the identifier to the set of posted comments
        } else {
            console.log("Comment already posted for this post or post identifier not found.");
            await page.reload({ waitUntil: 'networkidle0' });
        }

        // Refresh the page to check for new posts
        await page.reload({ waitUntil: 'networkidle0' });
        console.log("Refreshing the page...");
    }
}