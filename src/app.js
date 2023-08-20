// modules
const puppeteer = require('puppeteer-core');
const path = require('path');

// local modules
const {
  waitForRoleVisible,
  getLatestPostImage,
  getComments,
} = require('./libs/jobs/atom.job');
const {
  formatGroupUtil,
  delayUtil,
  urlUtil,
  commentUtil,
  loadCommentUtil,
  cookiesFileUtil,
  cookiesUtil,
} = require('./libs/utils');
const configAccount = require(path.join(__dirname, '/env/config.json'));

// config
const commentedPosts = loadCommentUtil();

// main bot
async function mainBot(childNumber = 8) {
  // get cookies
  const cookies = await cookiesUtil();

  try {
    // config puppeteer | just ignore it
    console.log('Launch browser...');
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-gpu', '--disable-notifications'],
      channel: 'chrome',
      // executablePath: '/usr/bin/chromium-browser',
    });

    // setup browser | just ignore it
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // console.log(JSON.parse(cookies));

    // check session
    if (cookies) {
      await page.setCookie(...cookies);
      console.log('login with session...');
    } else {
      // go to facebook
      console.log('Go to facebook...');
      await page.goto('https://www.facebook.com/', {
        timeout: 0,
        waitUntil: 'networkidle2',
      });

      // login process
      await page.waitForSelector('input#email');
      await page.type('input#email', configAccount.account.email, {
        delay: 100,
      });
      await page.waitForSelector('input#pass');
      await page.type('input#pass', configAccount.account.password, {
        delay: 100,
      });
      await page.keyboard.press('Enter');

      // waiting page load
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('Login success...');

      // set cookies
      let currentCookies = await page.cookies();
      await cookiesFileUtil(JSON.stringify(currentCookies));
      console.log('save session...');
    }

    // group facebook
    await page.goto(
      `${formatGroupUtil(
        configAccount.group_url
      )}?sorting_setting=CHRONOLOGICAL`,
      {
        timeout: 0,
        waitUntil: 'networkidle2',
      }
    );
    console.log('Go to group url : ', formatGroupUtil(configAccount.group_url));

    // main task jobs
    while (true) {
      // Wait for the new post to appear
      await waitForRoleVisible(page, 'feed');

      // Check if the newest post has an image
      const latestPostImage = await getLatestPostImage(page, childNumber);

      /*
        INI HANYA DEBUG - HAPUS JIKA DI PERLUKAN
      */
      // Scroll sedikit ke bawah
      await page.evaluate(() => {
        window.scrollBy(0, 1000); // Ganti nilai scroll sesuai kebutuhan
      });

      await delayUtil(page, 5000);
      /*
        INI HANYA DEBUG - HAPUS JIKA DI PERLUKAN
      */

      // check if true
      if (latestPostImage) {
        // If the newest post has an image and hasn't been commented yet, comment on it
        const isCommentedBefore = [...commentedPosts].some((item) =>
          urlUtil(item.comment, latestPostImage)
        );

        if (!isCommentedBefore) {
          // get comments
          const comments = await getComments(page);

          // simple check if comment exist
          if (!comments.includes(configAccount.comment)) {
            // wait textbox for comment
            await waitForRoleVisible(page, 'textbox');

            // configAccount.comment is comment from config.json
            await page.type('div[role="textbox"]', configAccount.comment, {
              delay: 5000,
            });
            // await page.keyboard.press('Enter');

            // save post to history file
            await commentUtil(latestPostImage);

            console.log(
              `[${new Date().toLocaleString()}] Komentar berhasil diposting`
            );
          } else {
            console.log('Komentar sudah ada. Melewati...');
          }
        } else {
          console.log('Postingan sudah dikomentari. Melewati...');
        }
        // Refresh the page regardless of whether the comment was posted or skipped
        await page.reload({ waitUntil: 'networkidle2' });
        console.log('Refreshing halaman...');
      } else {
        // If the newest post doesn't have an image, exit the loop
        await page.reload({ waitUntil: 'networkidle2' });
        console.log('No image found. Refreshing the page...');
      }
    }
    // end main task jobs
  } catch (error) {
    console.error('something error : ', error);
  }
}

// export
module.exports = mainBot;
