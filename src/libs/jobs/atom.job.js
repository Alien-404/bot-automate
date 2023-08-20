const { delayUtil } = require('../utils');

module.exports = {
  waitForRoleVisible: async (page, type = 'feed') => {
    while (true) {
      const roleVisible = await page.evaluate((roleType) => {
        const role = document.querySelector(`div[role="${roleType}"]`);
        return role && window.getComputedStyle(role).display !== 'none';
      }, type);

      if (roleVisible) {
        break; // Exit the loop if the role is visible
      }

      await page.reload({ waitUntil: 'networkidle2' });
      await delayUtil(page, 3000); // Wait for 3 seconds before checking again || deprecated func
    }
  },

  getLatestPostImage: async (page, childNumber = 8) => {
    return await page.evaluate((childNumberDiv) => {
      const feedElement = document.querySelector('div[role="feed"]');
      const checkImage = feedElement?.querySelector(
        `div:nth-child(${childNumberDiv})`
      );
      const imageElement = checkImage?.querySelector('img.x1ey2m1c');
      return imageElement ? imageElement.src : null;
    }, childNumber);
  },

  getComments: async (page) => {
    return await page.evaluate(() => {
      const commentElements = document.querySelectorAll(
        'div[data-testid="comment"]'
      );
      return Array.from(commentElements, (commentElement) => {
        const commentText = commentElement
          .querySelector('span[dir="ltr"]')
          .textContent.trim();
        return commentText;
      });
    });
  },
};
