async function delay(page, ms) {
  await page.evaluate((time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }, ms);
}

module.exports = delay;
