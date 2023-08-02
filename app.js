const puppeteer = require('puppeteer-core');
const fs = require('fs');
const commentedPosts = new Set();

autoComment('https://www.facebook.com/');

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function autoComment(url) {
    try {
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

        // Login process
        await page.waitForSelector('input#email');
        await page.type('input#email', 'pitertan0120@gmail.com', { delay: 100 });
        await page.waitForSelector('input#pass');
        await page.type('input#pass', 'pitertan2001', { delay: 100 });
        await page.keyboard.press('Enter');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        await page.goto("https://www.facebook.com/groups/106641399183172/", {
            timeout: 0,
            waitUntil: 'networkidle0',
        });

        while (true) {
            // Wait for the new post to appear
            await page.waitForSelector('div[role="feed"]');

            // Check if the newest post has an image
            const latestPostImage = await page.evaluate(() => {
                const postElement = document.querySelector('div[role="feed"]');
                const imageElement = postElement.querySelector('img');
                return imageElement ? imageElement.src : null;
            });

            if (latestPostImage) {
                // If the newest post has an image and hasn't been commented yet, comment on it
                if (!commentedPosts.has(latestPostImage)) {
                    // Get the list of comments in the post
                    const comments = await page.evaluate(() => {
                        const commentElements = document.querySelectorAll('div[data-testid="comment"]');
                        const commentsArray = [];
                        commentElements.forEach((commentElement) => {
                            const commentText = commentElement.querySelector('span[dir="ltr"]').textContent.trim();
                            commentsArray.push(commentText);
                        });
                        return commentsArray;
                    });

                    const commentToPost = "Ini adalah komentar otomatis menggunakan Puppeteer!";
                    const isCommentExist = comments.some((comment) => comment === commentToPost);

                    if (!isCommentExist) {
                        // If the comment doesn't exist in the post, proceed to post the comment
                        await page.waitForSelector('div[role="textbox"]');
                        await page.type('div[role="textbox"]', commentToPost, { delay: 100 });
                        await page.keyboard.press('Enter');

                        // Add the post URL to the set of commentedPosts
                        commentedPosts.add(latestPostImage);

                        // Wait for a short time to ensure the comment is posted successfully
                        await delay(2000);
                        console.log("Komentar berhasil diposting");
                    } else {
                        console.log("Komentar yang sama sudah ada dalam postingan. Melewati...");
                    }
                } else {
                    console.log("Postingan sudah dikomentari. Melewati...");
                }

                // Refresh the page regardless of whether the comment was posted or skipped
                await page.reload({ waitUntil: 'networkidle0' });
                console.log("Refreshing halaman...");
            } else {
                // If the newest post doesn't have an image, exit the loop
                await page.reload({ waitUntil: 'networkidle0' });
            console.log("No image found. Refreshing the page...");
            }
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
}