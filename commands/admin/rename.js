import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename the ticket channel')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('The new name for the channel')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction, client, settings) {
    try {
        // Check if the channel is a ticket
        const ticket = await client.db.tickets.findOne({
            channelId: interaction.channel.id,
            status: 'open'
        });

        if (!ticket) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription(settings.messages.ticketNotOpen)
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            return interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }

        const newName = interaction.options.getString('name');

        // Rename the channel
        await interaction.channel.setName(newName);

        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Success')
            .setDescription(`Channel renamed to: ${newName}`)
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [successEmbed]
        });

    } catch (error) {
        console.error('Error renaming channel:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error renaming the channel.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 