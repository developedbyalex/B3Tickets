import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('blacklist-list')
    .setDescription('View all blacklisted users')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction, client, settings) {
    try {
        // Get all blacklisted users
        const blacklistedUsers = await client.db.blacklist.find().sort({ addedAt: -1 });

        if (blacklistedUsers.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Blacklist')
                .setDescription('No users are currently blacklisted.')
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            return interaction.reply({
                embeds: [emptyEmbed]
            });
        }

        // Create paginated embeds
        const embeds = [];
        const usersPerPage = 5;
        const totalPages = Math.ceil(blacklistedUsers.length / usersPerPage);

        for (let i = 0; i < totalPages; i++) {
            const start = i * usersPerPage;
            const end = Math.min(start + usersPerPage, blacklistedUsers.length);
            const pageUsers = blacklistedUsers.slice(start, end);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Blacklisted Users')
                .setDescription(`Page ${i + 1} of ${totalPages}`)
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            for (const entry of pageUsers) {
                embed.addFields({
                    name: `<@${entry.userId}>`,
                    value: `**Reason:** ${entry.reason}\n**Blacklisted By:** <@${entry.addedBy}>\n**Date:** ${entry.addedAt.toLocaleString()}`
                });
            }

            embeds.push(embed);
        }

        // Send the first page
        const message = await interaction.reply({
            embeds: [embeds[0]],
            fetchReply: true
        });

        // Add reactions for navigation
        if (totalPages > 1) {
            await message.react('⬅️');
            await message.react('➡️');

            // Create reaction collector
            const filter = (reaction, user) => 
                ['⬅️', '➡️'].includes(reaction.emoji.name) && 
                user.id === interaction.user.id;

            const collector = message.createReactionCollector({
                filter,
                time: 300000 // 5 minutes
            });

            let currentPage = 0;

            collector.on('collect', async (reaction) => {
                if (reaction.emoji.name === '⬅️' && currentPage > 0) {
                    currentPage--;
                } else if (reaction.emoji.name === '➡️' && currentPage < totalPages - 1) {
                    currentPage++;
                }

                await message.edit({
                    embeds: [embeds[currentPage]]
                });
            });

            collector.on('end', async () => {
                await message.reactions.removeAll().catch(console.error);
            });
        }

    } catch (error) {
        console.error('Error viewing blacklist:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error viewing the blacklist.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 