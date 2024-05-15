require("dotenv").config();

const { Client, GatewayIntentBits, Events, Collection, REST, Routes, Partials } = require("discord.js");
const wordcloud = require("node-wordcloud");
const { Canvas } = require("canvas");
const chalk = require("chalk");
const { readdirSync } = require("fs");
const { join } = require("path");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	],
	partials: [
		Partials.Channel,
		Partials.Message,
	],
});

// Loading and registering slash commands
client.commands = new Collection();
const commands = [];
const commandFiles = readdirSync(join(__dirname, "./cmd"))
	.filter(fName => fName.endsWith(".js"));

for(const commandFile of commandFiles) {
	const command = require(join(__dirname, `./cmd/${commandFile}`));
	
	client.commands.set(command.info.name, command);
	commands.push(command.info.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
	console.log(chalk.blue(`Attempting to refresh ${commands.length} slash commands`));

	try {
		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENTID),
			{ body: commands },
		);

		console.log(chalk.green(`Successfully refreshed ${data.length} application commands`));
	}
	catch(err) {
		console.error(chalk.red(err));
	}
})();

// Client events
client.once(Events.ClientReady, (readyClient) => {
	console.log(chalk.green(`Logged in as ${readyClient.user.tag}`));
});

client.on(Events.InteractionCreate, async (interaction) => {
	if(!interaction.isChatInputCommand())
		return;

	const command = client.commands.get(interaction.commandName);

	if(!command) {
		console.error(chalk.red(`No command with the name ${interaction.commandName} was found?!`));
		return;
	}

	try {
		command.run(interaction);
	} catch(err) {
		console.error(chalk.red(err));

		if(interaction.replied || interaction.deferred)
			await interaction.followUp({ content: "Something went wrong while executing the command", ephemeral: true });
		else
			await interaction.reply({ content: "Something went wrong while executing the command", ephemeral: true });
	}
});

client.on(Events.MessageCreate, (message) => {
	if(message.author.bot)
		return;

	console.log(message.content);
});

client.login(process.env.DISCORD_TOKEN);