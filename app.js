const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.APIKEY,
    baseURL: process.env.BASEURL,
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/healthcheck', (req, res) => {
    res.status(200);
  });
  

  app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage }
      ],
      model: process.env.model,
    });
    res.send(response.choices[0].message.content);
  });

app.listen(PORT, () => {
  console.log(`nodejs running at port:${PORT}`);
});


