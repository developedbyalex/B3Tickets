import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('unblacklist')
    .setDescription('Remove a user from the blacklist')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('The user to remove from blacklist')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction, client, settings) {
    try {
        const user = interaction.options.getUser('user');

        // Check if user is blacklisted
        const blacklistEntry = await client.db.blacklist.findOne({ userId: user.id });
        if (!blacklistEntry) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription(`${user} is not blacklisted.`)
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            return interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }

        // Remove from blacklist
        await client.db.blacklist.deleteOne({ userId: user.id });

        // Log the unblacklist action
        await client.logger.log('blacklist_remove', {
            userId: user.id,
            removedBy: interaction.user.id
        });

        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Ticket Blacklist Removed')
                .setDescription(`You have been removed from the ticket blacklist in ${interaction.guild.name}`)
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error('Could not DM user:', error);
            // Log the DM error
            await client.logger.log('error', {
                error: 'Could not DM unblacklisted user',
                command: 'unblacklist',
                userId: interaction.user.id
            });
        }

        // Send success message
        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Success')
            .setDescription(`Removed ${user} from the blacklist`)
            .addFields(
                { name: 'Previously Blacklisted For', value: blacklistEntry.reason },
                { name: 'Originally Blacklisted By', value: `<@${blacklistEntry.addedBy}>` },
                { name: 'Blacklisted On', value: blacklistEntry.addedAt.toLocaleString() }
            )
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [successEmbed]
        });

    } catch (error) {
        console.error('Error removing user from blacklist:', error);
        // Log the error
        await client.logger.log('error', {
            error: error.message,
            command: 'unblacklist',
            userId: interaction.user.id
        });

        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error removing the user from the blacklist.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 