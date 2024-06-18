const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({
  apiKey: process.env.APIKEY,
  // baseURL: process.env.BASEURL,
});

app.get("/", (req, res) => {
  res.send("chatgpt backend");
});

app.get("/start", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/healthcheck", (req, res) => {
  res.send("success");
});

app.get("/assistants", async (req, res) => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
    limit: "20",
  });
  res.json(myAssistants);
});

app.get("/thread", async (req, res) => {
  const thread = await openai.beta.threads.create();
  res.json(thread.id);
});

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const response = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userMessage },
    ],
    model: process.env.model,
  });
  res.json({ message: response.choices[0].message.content });
});

app.post("/api/assistant/chat", async (req, res) => {
  const userMessage = req.body.message;
  let assistantID = req.body.assistantID || process.env.ASSISTANTID;

  let threadID = req.body.threadID;
  if (!threadID) {
    const thread = await openai.beta.threads.create();
    threadID = thread.id;
  }

  const message = await openai.beta.threads.messages.create(threadID, {
    role: "user",
    content: userMessage,
  });

  let run = await openai.beta.threads.runs.createAndPoll(threadID, {
    assistant_id: assistantID,
  });

  let messages;
  if (run.status === "completed") {
    messages = await openai.beta.threads.messages.list(run.thread_id);
    let firstAssistantMessage;
    for (const message of messages.data) {
      console.log(`${message.role} > ${message.content[0].text.value}`);
      if (message.role === "assistant") {
        firstAssistantMessage = message.content[0].text.value;
        break;
      }
    }
    res.send(firstAssistantMessage || "No assistant message found");
  } else {
    console.log(run.status);
    res.send("error");
  }
});

app.listen(PORT, () => {
  console.log(`nodejs running at port:${PORT}`);
});
