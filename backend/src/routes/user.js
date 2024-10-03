const express = require('express');
const router = express.Router();

router.get('/info', (req, res) => {
  const userInfo = req.cookies.user_info;
  if (userInfo) {
    try {
      const parsedUserInfo = JSON.parse(userInfo);
      res.json({ email: parsedUserInfo.email });
    } catch (error) {
      console.error('Error parsing user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});

module.exports = router;