const express = require('express');
const router = express.Router();
const youtube = require('../services/youtube');

router.get('/latest', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const [videos, channel, isLive] = await Promise.all([
      youtube.getLatestVideos(limit),
      youtube.getChannelInfo(),
      youtube.checkLiveStatus()
    ]);
    res.json({ channel, videos, isLive });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
