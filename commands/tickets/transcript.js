import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

export const data = new SlashCommandBuilder()
    .setName('transcript')
    .setDescription('Generate a transcript of the ticket')
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
                    { name: 'Created At', value: ticket.createdAt.toLocaleString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            await logsChannel.send({
                embeds: [transcriptEmbed],
                files: [transcript]
            });
        }

        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Success')
            .setDescription('Transcript has been generated and sent to the logs channel.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [successEmbed]
        });

    } catch (error) {
        console.error('Error generating transcript:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error generating the transcript.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 