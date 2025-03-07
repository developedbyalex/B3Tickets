import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('alert')
    .setDescription('Alert the user that the ticket will be closed')
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
                .setTitle('❌ Error')
                .setDescription(settings.messages.ticketNotOpen)
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            return interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }

        // Create the alert embed
        const alertEmbed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle(settings.messages.alertTitle)
            .setDescription(settings.messages.alertDescription.replace('{user}', interaction.user.toString()))
            .addFields(
                { name: '⚠️ Warning', value: 'This action cannot be undone.', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        // Create the buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close_confirm')
                    .setLabel(settings.messages.alertCloseButton)
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_close_cancel')
                    .setLabel(settings.messages.alertCancelButton)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

        // Send the alert message
        await interaction.reply({
            embeds: [alertEmbed],
            components: [row]
        });

    } catch (error) {
        console.error('Error creating alert:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Error')
            .setDescription(settings.messages.alertError)
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 