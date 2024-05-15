const { SlashCommandBuilder, CommandInteraction } = require("discord.js");

module.exports = {
	info: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Returns the latency of the bot!"),
	/**
	 * @param {CommandInteraction} interaction 
	 */
	async run(interaction) {
		interaction.reply(`Pong 🏓! My latency is \`${Date.now() - interaction.createdTimestamp}\`ms`);
	}
}