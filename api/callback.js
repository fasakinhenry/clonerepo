const axios = require('axios');
require('dotenv').config();

module.exports = async (req, res) => {
  const { code } = req.query;

  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URI,
    },
    {
      headers: {
        accept: 'application/json',
      },
    }
  );

  const accessToken = response.data.access_token;
  res.status(200).send(`Authentication successful! You can close this window.`);
};
