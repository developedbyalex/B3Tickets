import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { dirname } from 'path';
import { Logger } from './utils/logger.js';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load settings
const settings = yaml.load(fs.readFileSync('./settings.yml', 'utf8'));

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Initialize logger
client.logger = new Logger(client, settings);

// Load commands
const loadCommands = async () => {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = await import(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`[COMMAND] Loaded command: ${command.data.name}`);
            } else {
                console.warn(`[WARNING] Command at ${filePath} is missing required properties`);
            }
        }
    }
};

// Load events
const loadEvents = async () => {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = await import(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, settings));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, settings));
        }

        console.log(`[EVENT] Loaded event: ${event.name}`);
    }
};

// Connect to MongoDB
const connectToDatabase = async () => {
    try {
        await mongoose.connect(settings.mongodbAtlas);
        console.log('[DATABASE] Connected to MongoDB');

        // Create ticket schema
        const ticketSchema = new mongoose.Schema({
            userId: String,
            channelId: String,
            category: String,
            status: String,
            createdAt: Date
        });

        // Create blacklist schema
        const blacklistSchema = new mongoose.Schema({
            userId: String,
            reason: String,
            addedBy: String,
            addedAt: Date
        });

        // Create collections
        client.db = {
            tickets: mongoose.model('Ticket', ticketSchema),
            blacklist: mongoose.model('Blacklist', blacklistSchema)
        };

    } catch (error) {
        console.error('[ERROR] Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

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
                text: settings.messages.footer || 'B3Tickets'
            }
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorMessage], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorMessage], ephemeral: true });
        }
    }
});

// Ready event
client.once('ready', () => {
    console.log(`[READY] Logged in as ${client.user.tag}`);
    console.log(`[READY] Serving ${client.guilds.cache.size} guilds`);

    // Set bot status if enabled
    if (settings.status.enabled) {
        const statusType = settings.status.status.toLowerCase();
        const activity = settings.status.activity;

        let activityType;
        switch (statusType) {
            case 'playing':
                activityType = 0; // Playing
                break;
            case 'listening':
                activityType = 2; // Listening
                break;
            case 'watching':
                activityType = 3; // Watching
                break;
            case 'competing':
                activityType = 5; // Competing
                break;
            default:
                activityType = 0; // Default to Playing
        }

        client.user.setActivity(activity, { type: activityType });
    }
});

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
const startBot = async () => {
    try {
        await connectToDatabase();
        await loadCommands();
        await loadEvents();
        await client.login(settings.token);
    } catch (error) {
        console.error('[ERROR] Failed to start bot:', error);
        process.exit(1);
    }
};

// Start the bot
startBot(); 