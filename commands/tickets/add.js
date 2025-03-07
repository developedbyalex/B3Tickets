import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to the ticket')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('The user to add to the ticket')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

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

        const user = interaction.options.getUser('user');

        // Add user to the channel
        await interaction.channel.permissionOverwrites.create(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Success')
            .setDescription(`Added ${user} to the ticket`)
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [successEmbed]
        });

    } catch (error) {
        console.error('Error adding user to ticket:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error adding the user to the ticket.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 