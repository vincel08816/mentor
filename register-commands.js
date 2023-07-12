require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const query = {
  name: "query",
  description:
    "State your intentions! Mentor will answer to the best of her abilities!",
  type: ApplicationCommandOptionType.String,
  required: true,
};

const commands = [
  { name: "ping", description: "replies with pong" },
  {
    name: "uwu",
    description: "Mentor will respond to you in a uwu manner!",
    options: [query],
  },
  {
    name: "gpt3",
    description: "Mentor will connect to gpt3-turbo model!",
    options: [query],
  },
  {
    name: "gpt3e",
    description: "Mentor will connect to gpt3-turbo model!",
    options: [query],
  },
  {
    name: "gpt4",
    description: "Mentor will connect to gpt4 model!",
    options: [query],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
  } catch (error) {
    console.log(`There was an error ${error}`);
  }
})();
