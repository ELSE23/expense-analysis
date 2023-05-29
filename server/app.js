/* eslint-disable no-undef */
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

const notionApiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

app.post('/databases', bodyParser.json(), async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: `https://api.notion.com/v1/databases/${databaseId}/query`,
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        Authorization: `Bearer ${notionApiKey}`
      },
      data: req.body
    });

    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.listen(8888, () => {
  console.log('Server is listening on port 8888');
});
