import { Events } from 'discord.js';
import { isWithinWorkingHours, getNextWorkingHours } from '../utils/workingHours.js';

export const name = Events.InteractionCreate;

export async function execute(interaction, client, settings) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client, settings);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                color: 0xFF0000,
                title: 'Error',
                description: 'There was an error executing this command!',
                timestamp: new Date(),
                footer: {
                    text: settings.transcripts.footer
                }
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorMessage], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorMessage], ephemeral: true });
            }
        }
    }

    // Handle button interactions
    if (interaction.isButton()) {
        if (interaction.customId === 'ticket_close_confirm') {
            try {
                // Check if the channel is a ticket
                const ticket = await client.db.tickets.findOne({
                    channelId: interaction.channel.id,
                    status: 'open'
                });

                if (!ticket) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Error',
                        description: settings.messages.ticketNotOpen,
                        timestamp: new Date(),
                        footer: {
                            text: settings.transcripts.footer
                        }
                    };

                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    });
                    return;
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
                    const transcriptEmbed = {
                        color: 0x695acd,
                        title: 'Ticket Transcript',
                        description: `Transcript for ticket ${interaction.channel.name}`,
                        fields: [
                            { name: 'Ticket Creator', value: `<@${ticket.userId}>`, inline: true },
                            { name: 'Category', value: ticket.category, inline: true },
                            { name: 'Created At', value: ticket.createdAt.toLocaleString(), inline: true },
                            { name: 'Closed By', value: interaction.user.tag, inline: true }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: settings.transcripts.footer
                        }
                    };

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
                const closingEmbed = {
                    color: 0xff0000,
                    title: 'Ticket Closing',
                    description: settings.messages.ticketClosed,
                    timestamp: new Date(),
                    footer: {
                        text: settings.transcripts.footer
                    }
                };

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
                const errorEmbed = {
                    color: 0xFF0000,
                    title: 'Error',
                    description: 'There was an error closing the ticket.',
                    timestamp: new Date(),
                    footer: {
                        text: settings.transcripts.footer
                    }
                };

                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
        } else if (interaction.customId === 'ticket_close_cancel') {
            const cancelEmbed = {
                color: 0x00ff00,
                title: settings.messages.alertCancelledTitle,
                description: settings.messages.alertCancelled,
                timestamp: new Date(),
                footer: {
                    text: settings.transcripts.footer
                }
            };

            await interaction.reply({
                embeds: [cancelEmbed]
            });
        }
    }

    // Handle dropdown menu interactions
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'ticket_create') {
            try {
                // Check if user is blacklisted
                const blacklistEntry = await client.db.blacklist.findOne({ userId: interaction.user.id });
                if (blacklistEntry) {
                    const blacklistEmbed = {
                        color: 0xFF0000,
                        title: 'Error',
                        description: 'You are blacklisted from creating tickets.',
                        fields: [
                            { name: 'Reason', value: blacklistEntry.reason },
                            { name: 'Blacklisted By', value: `<@${blacklistEntry.addedBy}>` }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: settings.transcripts.footer
                        }
                    };

                    await interaction.reply({
                        embeds: [blacklistEmbed],
                        ephemeral: true
                    });
                    return;
                }

                const selectedCategory = settings.ticketCategories.find(
                    category => category.value === interaction.values[0]
                );

                if (!selectedCategory) {
                    throw new Error('Invalid category selected');
                }

                // Check if user already has an open ticket
                const existingTicket = await client.db.tickets.findOne({
                    userId: interaction.user.id,
                    status: 'open'
                });

                if (existingTicket) {
                    const errorEmbed = {
                        color: 0xFF0000,
                        title: 'Error',
                        description: settings.messages.ticketAlreadyExists,
                        timestamp: new Date(),
                        footer: {
                            text: settings.transcripts.footer
                        }
                    };

                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    });
                    return;
                }

                // Create the ticket channel
                const channelName = selectedCategory.channelName.replace(
                    '<username>',
                    interaction.user.username.toLowerCase()
                );

                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: 0, // Text channel
                    parent: settings.ticketCategory,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                        },
                        ...selectedCategory.supportRoles.map(roleId => ({
                            id: roleId,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                        })),
                    ],
                });

                // Create initial ticket message
                const ticketEmbed = {
                    color: 0x695acd,
                    title: `Ticket: ${selectedCategory.label}`,
                    description: `Welcome ${interaction.user}! Please describe your issue in detail.\n\n**Category:** ${selectedCategory.label}\n**Created by:** ${interaction.user.tag}`,
                    timestamp: new Date(),
                    footer: {
                        text: settings.transcripts.footer
                    }
                };

                await ticketChannel.send({
                    embeds: [ticketEmbed],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 4,
                                    label: 'Close Ticket',
                                    custom_id: 'ticket_close',
                                    emoji: '🔒'
                                }
                            ]
                        }
                    ]
                });

                // Save ticket to database
                await client.db.tickets.create({
                    userId: interaction.user.id,
                    channelId: ticketChannel.id,
                    category: selectedCategory.value,
                    status: 'open',
                    createdAt: new Date()
                });

                // Check if we're within working hours
                if (!isWithinWorkingHours(settings)) {
                    const nextHours = getNextWorkingHours(settings);
                    const outOfHoursEmbed = {
                        color: 0xFFA500,
                        title: 'Out of Working Hours',
                        description: 'Our support team is currently offline. We will respond to your ticket during our next working hours.',
                        fields: [
                            { 
                                name: 'Next Working Hours', 
                                value: `Start: <t:${Math.floor(nextHours.start.toSeconds())}:F>\nEnd: <t:${Math.floor(nextHours.end.toSeconds())}:F>` 
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: settings.transcripts.footer
                        }
                    };

                    await ticketChannel.send({ embeds: [outOfHoursEmbed] });
                }

                // Send success message
                const successEmbed = {
                    color: 0x00ff00,
                    title: 'Success',
                    description: settings.messages.ticketCreated,
                    timestamp: new Date(),
                    footer: {
                        text: settings.transcripts.footer
                    }
                };

                await interaction.reply({
                    embeds: [successEmbed],
                    ephemeral: true
                });

            } catch (error) {
                console.error('Error creating ticket:', error);
                const errorEmbed = {
                    color: 0xFF0000,
                    title: 'Error',
                    description: 'There was an error creating your ticket. Please try again.',
                    timestamp: new Date(),
                    footer: {
                        text: settings.transcripts.footer
                    }
                };

                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
        }
    }
} 