const { SlashCommandBuilder, CommandInteraction, EmbedBuilder, AttachmentBuilder, GuildMessageManager } = require("discord.js");
const Wordcloud = require("node-wordcloud")();
const { createCanvas } = require("canvas");
const { getListFromMessageArray } = require("../util/wordcloud");

module.exports = {
	info: new SlashCommandBuilder()
		.setName("wordcloud-channel")
		.setDescription("Generates a wordcloud for the most recent few messages in a specified channel")
		.addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("The channel whose messages you want me to analyse. Defaults to the current channel")
				.setRequired(false)
		)
		.addIntegerOption(option =>
			option
				.setName("msgcount")
				.setDescription("The number of messages you wish for me to analyse. Defaults to 50. Max 100. Min 1.")
				.setRequired(false)
		),
	/**
	 * @param {CommandInteraction} interaction 
	 */
	async run(interaction) {
		// parameters and variables
		const msgCount = interaction.options.data.filter(v => v.name === "msgcount")[0]?.value || 50;
		const channelID = interaction.options.data.filter(v => v.name === "channel")[0]?.value || interaction.channelId;
		const canvas = createCanvas(500, 500);
		
		// checking if the input is proper.
		const channel = await interaction.client.channels.fetch(channelID);
		if(!channel.isTextBased)
			return interaction.reply("The channel **needs** to be a text channel!");
		if(!Number.isInteger(msgCount) || msgCount < 1 || msgCount > 100)
			return interaction.reply("The number of messages to fetch **needs** to be an positive integer in the range 1 to 100 (both inclusive)");
		// preventing NSFW content in SFW channels
		if(channel.nsfw && !interaction.channel.nsfw)
			return interaction.reply("Since this is a SFW channel, I cannot display the wordcloud for an NSFW channel in the server. Please try this command in an NSFW channel, or try to view the cloud for an SFW channel!");

		// deferring the reply because skill issue
		await interaction.deferReply({
			ephemeral: false,
			fetchReply: true,
		});

		// getting the word frequency list to feed into the canvas
		/**
		 * @type {GuildMessageManager}
		 */
		const messageManager = channel.messages;
		const messages = await messageManager.fetch({
			limit: msgCount,
		});

		const list = getListFromMessageArray(messages.toJSON());
		const wordcloud = Wordcloud(canvas, { list });
		wordcloud.draw();

		// packaging the data off
		const attachmentFile = new AttachmentBuilder(canvas.toBuffer(), { name: "wordcloud.png" });
		const attachmentEmbed = new EmbedBuilder()
			.setImage("attachment://wordcloud.png");

		await interaction.followUp({
			embeds: [attachmentEmbed],
			files: [attachmentFile],
		});
	}
}