import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user from creating tickets')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('The user to blacklist')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('reason')
            .setDescription('The reason for blacklisting')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction, client, settings) {
    try {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        // Check if user is already blacklisted
        const existingBlacklist = await client.db.blacklist.findOne({ userId: user.id });
        if (existingBlacklist) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription(`${user} is already blacklisted.`)
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            return interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
        }

        // Add to blacklist in database
        await client.db.blacklist.create({
            userId: user.id,
            reason: reason,
            addedBy: interaction.user.id,
            addedAt: new Date()
        });

        // Log the blacklist action
        await client.logger.log('blacklist_add', {
            userId: user.id,
            reason: reason,
            addedBy: interaction.user.id
        });

        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Ticket Blacklist')
                .setDescription(`You have been blacklisted from creating tickets in ${interaction.guild.name}`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Blacklisted By', value: interaction.user.tag }
                )
                .setTimestamp()
                .setFooter({ text: settings.transcripts.footer });

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error('Could not DM user:', error);
            // Log the DM error
            await client.logger.log('error', {
                error: 'Could not DM blacklisted user',
                command: 'blacklist',
                userId: interaction.user.id
            });
        }

        // Send success message
        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Success')
            .setDescription(`Blacklisted ${user} from creating tickets`)
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Blacklisted By', value: interaction.user.tag }
            )
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [successEmbed]
        });

    } catch (error) {
        console.error('Error blacklisting user:', error);
        // Log the error
        await client.logger.log('error', {
            error: error.message,
            command: 'blacklist',
            userId: interaction.user.id
        });

        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('There was an error blacklisting the user.')
            .setTimestamp()
            .setFooter({ text: settings.transcripts.footer });

        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
    }
} 