import { EmbedBuilder } from 'discord.js';

export class Logger {
    constructor(client, settings) {
        this.client = client;
        this.settings = settings;
    }

    async log(type, data) {
        if (!this.settings.logging.enabled) return;

        try {
            const channel = await this.client.channels.fetch(this.settings.logging.channel);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTimestamp()
                .setFooter({ text: this.settings.transcripts.footer });

            switch (type) {
                case 'ticket_create':
                    embed
                        .setColor('#00ff00')
                        .setTitle('Ticket Created')
                        .setDescription(`A new ticket has been created`)
                        .addFields(
                            { name: 'User', value: `<@${data.userId}>`, inline: true },
                            { name: 'Category', value: data.category, inline: true },
                            { name: 'Channel', value: `<#${data.channelId}>`, inline: true }
                        );
                    break;

                case 'ticket_close':
                    embed
                        .setColor('#ff0000')
                        .setTitle('Ticket Closed')
                        .setDescription(`A ticket has been closed`)
                        .addFields(
                            { name: 'User', value: `<@${data.userId}>`, inline: true },
                            { name: 'Category', value: data.category, inline: true },
                            { name: 'Closed By', value: `<@${data.closedBy}>`, inline: true }
                        );
                    break;

                case 'blacklist_add':
                    embed
                        .setColor('#ff0000')
                        .setTitle('User Blacklisted')
                        .setDescription(`A user has been blacklisted from creating tickets`)
                        .addFields(
                            { name: 'User', value: `<@${data.userId}>`, inline: true },
                            { name: 'Reason', value: data.reason },
                            { name: 'Blacklisted By', value: `<@${data.addedBy}>`, inline: true }
                        );
                    break;

                case 'blacklist_remove':
                    embed
                        .setColor('#00ff00')
                        .setTitle('User Unblacklisted')
                        .setDescription(`A user has been removed from the blacklist`)
                        .addFields(
                            { name: 'User', value: `<@${data.userId}>`, inline: true },
                            { name: 'Removed By', value: `<@${data.removedBy}>`, inline: true }
                        );
                    break;

                case 'ticket_add':
                    embed
                        .setColor('#00ff00')
                        .setTitle('User Added to Ticket')
                        .setDescription(`A user has been added to a ticket`)
                        .addFields(
                            { name: 'User', value: `<@${data.userId}>`, inline: true },
                            { name: 'Added By', value: `<@${data.addedBy}>`, inline: true },
                            { name: 'Channel', value: `<#${data.channelId}>`, inline: true }
                        );
                    break;

                case 'ticket_remove':
                    embed
                        .setColor('#ff0000')
                        .setTitle('User Removed from Ticket')
                        .setDescription(`A user has been removed from a ticket`)
                        .addFields(
                            { name: 'User', value: `<@${data.userId}>`, inline: true },
                            { name: 'Removed By', value: `<@${data.removedBy}>`, inline: true },
                            { name: 'Channel', value: `<#${data.channelId}>`, inline: true }
                        );
                    break;

                case 'error':
                    embed
                        .setColor('#ff0000')
                        .setTitle('Error Occurred')
                        .setDescription(data.error)
                        .addFields(
                            { name: 'Command', value: data.command || 'N/A', inline: true },
                            { name: 'User', value: `<@${data.userId}>`, inline: true }
                        );
                    break;
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging:', error);
        }
    }
} 