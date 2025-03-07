import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

export const data = new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the ticket')
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

        // Generate transcript
        const transcript = await createTranscript(interaction.channel, {
            limit: -1,
            fileName: `transcript-${interaction.channel.name}.html`,
            saveImages: true,
            poweredBy: false,
            footerText: `${settings.transcripts.footer} • ${new Date().toLocaleString()}`,
        });

        // Send transcript to logs channel
        const logsChannel = await interaction.guild.channels.fetch(settings.transcripts.channel);
        if (logsChannel) {
            const transcriptEmbed = new EmbedBuilder()
                .setColor('#695acd')
                .setTitle('Ticket Transcript')
                .setDescription(`Transcript for ticket ${interaction.channel.name}`)
                .addFields(
                    { name: 'Ticket Creator', value: `<@${ticket.userId}>`, inline: true },
                    { name: 'Category', value: ticket.category, inline: true },
                    { name: 'Created At', value: ticket.createdAt.toLocaleString(), inline: true },
                    { name: 'Closed By', value: interaction.user.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            await logsChannel.send({
                embeds: [transcriptEmbed],
                files: [transcript]
            });
        }

        // Update ticket status in database
        await client.db.tickets.updateOne(
            { channelId: interaction.channel.id },
            { $set: { status: 'closed' } }
        );

        // Send closing message
        const closingEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Ticket Closing')
            .setDescription(settings.messages.ticketClosed)
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [closingEmbed]
        });

        // Delete the channel after 5 seconds
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error deleting channel:', error);
            }
        }, 5000);

    } catch (error) {
        console.error('Error closing ticket:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error closing the ticket.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 