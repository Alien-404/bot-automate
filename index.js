// modules
const puppeteer = require('puppeteer-core');
const configAccount = require('./config.json');
const { spawn } = require('child_process');
const commentedFile = require('./commented.json');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');

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

function compareUrlsIgnoreSid(url1, url2) {
  const url1WithoutSid = url1.replace(/&_nc_sid=[^&]+/, '');
  const url2WithoutSid = url2.replace(/&_nc_sid=[^&]+/, '');
  return url1WithoutSid === url2WithoutSid;
}

// main func
async function mainBot() {
  try {
    // config puppeteer | just ignore it
    console.log('Launch browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
      channel: 'chrome',
      // executablePath: '/usr/bin/chromium-browser',
    });

    // setup browser | just ignore it
    console.log('Go to facebook...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('https://www.facebook.com/', {
      timeout: 0,
      waitUntil: 'networkidle2',
    });

    // login process
    await page.waitForSelector('input#email');
    await page.type('input#email', configAccount.account.email, { delay: 100 });
    await page.waitForSelector('input#pass');
    await page.type('input#pass', configAccount.account.password, {
      delay: 100,
    });
    await page.keyboard.press('Enter');

    // waiting page load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Login success...');

    // navigate to group page
    await page.goto(
      configAccount.group_url.replace(/\/$/, '') +
        '?sorting_setting=CHRONOLOGICAL',
      {
        timeout: 0,
        waitUntil: 'networkidle2',
      }
    );
    console.log('Go to group url : ', configAccount.group_url);

    // infinite loop
    while (true) {
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
        await delay(5000); // Wait for 3 second before checking again
      }

      // Check if the newest post has an image
      const latestPostImage = await page.evaluate(() => {
        const feedElement = document.querySelector('div[role="feed"]');
        const checkImage =
          feedElement && feedElement.querySelector('div:nth-child(2)');

        if (checkImage) {
          const imageElement = checkImage.querySelector('img');
          return imageElement ? imageElement.src : null;
        }

        return null;
      });

      // check if true
      if (latestPostImage) {
        // If the newest post has an image and hasn't been commented yet, comment on it
        if (
          ![...commentedPosts].some((item) =>
            compareUrlsIgnoreSid(item, latestPostImage)
          )
        ) {
          // Get the list of comments in the post
          const comments = await page.evaluate(() => {
            const commentElements = document.querySelectorAll(
              'div[data-testid="comment"]'
            );
            const commentsArray = [];
            commentElements.forEach((commentElement) => {
              const commentText = commentElement
                .querySelector('span[dir="ltr"]')
                .textContent.trim();
              commentsArray.push(commentText);
            });
            return commentsArray;
          });

          // simple check if comment exist
          const isCommentExist = comments.some(
            (comment) => comment === configAccount.comment
          );

          // check comment post
          if (!isCommentExist) {
            // post commnet
            // await page.waitForSelector('div[role="textbox"]');

            while (true) {
              const textboxVisible = await page.evaluate(() => {
                const textbox = document.querySelector('div[role="textbox"]');
                return (
                  textbox && window.getComputedStyle(textbox).display !== 'none'
                );
              });

              if (textboxVisible) {
                break; // Exit the loop if the textbox is visible
              }

              await page.reload({ waitUntil: 'networkidle2' });
              await delay(3000); // Wait for 1 second before checking again
            }

            await page.type('div[role="textbox"]', configAccount.comment, {
              delay: 100,
            }); // configAccount.comment is comment from config.json
            await page.keyboard.press('Enter');

            // save post to history file
            commentedPosts.add(latestPostImage);
            await writeCommentedPosts();

            // delay for success
            await delay(2000); // 2 seconds
            console.log('Komentar berhasil diposting');
          } else {
            console.log(
              'Komentar yang sama sudah ada dalam postingan. Melewati...'
            );
          }
        } else {
          console.log('Postingan sudah dikomentari. Melewati...');
        }
        // end if newest post has an image and hasn't been commented yet

        // Refresh the page regardless of whether the comment was posted or skipped
        await page.reload({ waitUntil: 'networkidle2' });
        console.log('Refreshing halaman...');
      } else {
        // If the newest post doesn't have an image, exit the loop
        await page.reload({ waitUntil: 'networkidle2' });
        console.log('No image found. Refreshing the page...');
      }
    }
  } catch (error) {
    console.error('something error : ', error);
  }
}

// run main function
(async () => {
  if (
    Object.values(configAccount.account).some((value) => value == null) ||
    configAccount.comment == null ||
    configAccount.group_url == null
  ) {
    console.log(`please run 'npm run setup' first!`);
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
