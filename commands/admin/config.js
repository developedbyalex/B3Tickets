import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure ticket settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('category')
            .setDescription('Set the category where tickets will be created')
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('The category channel')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('transcript')
            .setDescription('Set the channel where transcripts will be sent')
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('The transcript channel')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('color')
            .setDescription('Set the color for embeds')
            .addStringOption(option =>
                option
                    .setName('color')
                    .setDescription('The hex color code (e.g., #695acd)')
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction, client, settings) {
    try {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'category': {
                const channel = interaction.options.getChannel('channel');
                if (channel.type !== 4) { // 4 is category type
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Error')
                        .setDescription('Please select a category channel.')
                        .setTimestamp()
                        .setFooter({ text: settings.transcripts.footer });

                    return interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    });
                }

                settings.ticketCategory = channel.id;
                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription(`Ticket category set to: ${channel.name}`)
                    .setTimestamp()
                    .setFooter({ text: settings.transcripts.footer });

                await interaction.reply({
                    embeds: [successEmbed]
                });
                break;
            }

            case 'transcript': {
                const channel = interaction.options.getChannel('channel');
                settings.transcripts.channel = channel.id;
                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription(`Transcript channel set to: ${channel.name}`)
                    .setTimestamp()
                    .setFooter({ text: settings.transcripts.footer });

                await interaction.reply({
                    embeds: [successEmbed]
                });
                break;
            }

            case 'color': {
                const color = interaction.options.getString('color');
                if (!/^#[0-9A-F]{6}$/i.test(color)) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Error')
                        .setDescription('Please provide a valid hex color code (e.g., #695acd)')
                        .setTimestamp()
                        .setFooter({ text: settings.transcripts.footer });

                    return interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    });
                }

                settings.panelColor = color;
                const successEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle('Success')
                    .setDescription(`Embed color set to: ${color}`)
                    .setTimestamp()
                    .setFooter({ text: settings.transcripts.footer });

                await interaction.reply({
                    embeds: [successEmbed]
                });
                break;
            }
        }

    } catch (error) {
        console.error('Error configuring settings:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error configuring the settings.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 