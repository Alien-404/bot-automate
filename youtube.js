const puppeteer = require('puppeteer');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function start() {
  console.log('starting...');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Menggunakan console.time() untuk memulai hitungan waktu
  console.time('total_execution_time');

  // step
  await page.goto('https://www.youtube.com/');

  //   wait
  await page.waitForSelector('input#search');
  await page.type('input#search', 'jujutsu kaisen trailer', { delay: 200 });
  await page.keyboard.press('Enter');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.waitForSelector(
    'div#contents> ytd-video-renderer:first-child a#thumbnail'
  );
  await page.click('div#contents> ytd-video-renderer:first-child a#thumbnail');

  await delay(4000);

  await page.screenshot({ path: 'pictures/yt-jujutsu-kaisen-trailer.png' });

  await browser.close();

  // Menggunakan console.timeEnd() untuk menghentikan hitungan waktu dan mencetak hasilnya
  console.timeEnd('total_execution_time');
}

start();
