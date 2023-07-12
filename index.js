require("dotenv").config();
const axios = require("axios");
const { Client, IntentsBitField } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const { Guilds, GuildMessages, MessageContent } = IntentsBitField.Flags;
const client = new Client({
  intents: [Guilds, GuildMessages, MessageContent],
});

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

client.once("ready", () => {
  console.log("Client ready");
});

client.login(process.env.TOKEN);

const systemMessages = {
  uwu: {
    role: "system",
    content:
      "You are a friendly chatbot called Mentor. You are a bit silly and speak in a uwu anime style voice",
  },
  gpt3: {
    role: "system",
    content: "You are a friendly chatbot",
  },
  gpt3e: {
    role: "system",
    content: "You are a friendly chatbot",
  },
  gpt4: {
    role: "system",
    content: "You are a friendly chatbot",
  },
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "ping":
      await interaction.reply("pong");
    case "uwu":
      await queryOpenai(interaction, systemMessages.uwu);
    case "gpt3":
      await queryOpenai(interaction, systemMessages.gpt3);
    case "gpt4":
      await queryOpenai(interaction, systemMessages.gpt4, "gpt4");
  }
});

const queryOpenai = async (
  interaction,
  systemMessage,
  model = "gpt-3.5-turbo"
) => {
  try {
    const messages = await getMessagesFromDiscord(interaction, systemMessage);

    const moderationResults = await getOpenaiModerationResults(
      JSON.stringify(messages)
    );

    if (moderationResults[0].flagged) {
      await interaction.reply("Failed moderation request");
      return;
    }

    const apiResponse = await openai.createChatCompletion({ model, messages });

    await interaction.reply(apiResponse.data.choices[0].message.content);
  } catch (error) {
    console.error(error);
    await interaction.reply("Mentor cannot comprehend :(");
  }
};

const getMessagesFromDiscord = async (interaction, systemMessage) => {
  const messages = [systemMessage];
  const query = interaction.options.get("query").value;

  let previousMessages = await interaction.channel.messages.fetch({
    limit: 15,
  });
  previousMessages.reverse();

  previousMessages.forEach((message) => {
    const role = message.author.bot ? "assistant" : "user";
    const content = message.content;
    messages.push({ role, content });
  });
  messages.push({ role: "user", content: query });

  return messages;
};

const getOpenaiModerationResults = async (text) => {
  const url = "https://api.openai.com/v1/moderations";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  try {
    const response = await axios.post(url, { input: text }, { headers });
    return response?.data?.results;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
