import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Create the ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction, client, settings) {
    try {
        // Create the embed
        const embed = new EmbedBuilder()
            .setColor(settings.panelColor)
            .setTitle(settings.panelTitle)
            .setDescription(settings.panelDescription)
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        // Create the dropdown menu
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_create')
                    .setPlaceholder(settings.dropdownPlaceholder)
                    .addOptions(
                        settings.ticketCategories.map(category => ({
                            label: category.label,
                            description: category.description,
                            value: category.value,
                            emoji: category.emoji || undefined
                        }))
                    )
            );

        // Send the panel
        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // Reply to the command
        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Success')
            .setDescription('Ticket panel has been created successfully!')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [successEmbed],
            ephemeral: true
        });

    } catch (error) {
        console.error('Error creating panel:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error creating the ticket panel. Please try again.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 