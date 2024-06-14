const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
    apiKey: process.env.APIKEY,
    baseURL: process.env.BASEURL,
});

app.get('/', (req, res) => {
  res.send('chatgpt backend');
});

app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    res.json({ message: response.choices[0].message.content });
});

app.listen(PORT, () => {
  console.log(`nodejs running at port:${PORT}`);
});


