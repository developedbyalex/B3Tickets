# 🎫 B3Tickets

<div align="center">

[![Discord](https://img.shields.io/discord/1234567890?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.byalex.gg/)
[![GitHub](https://img.shields.io/github/license/developedbyalex/B3Tickets?color=7289da&label=License&logo=github&logoColor=white)](https://github.com/developedbyalex/B3Tickets/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/developedbyalex/B3Tickets?color=7289da&label=Stars&logo=github&logoColor=white)](https://github.com/developedbyalex/B3Tickets/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/developedbyalex/B3Tickets?color=7289da&label=Issues&logo=github&logoColor=white)](https://github.com/developedbyalex/B3Tickets/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/developedbyalex/B3Tickets?color=7289da&label=Pull%20Requests&logo=github&logoColor=white)](https://github.com/developedbyalex/B3Tickets/pulls)

A powerful and feature-rich Discord ticket bot built with Discord.js v14

[![Discord Banner](https://img.shields.io/discord/1234567890?color=7289da&label=Join%20Discord&logo=discord&logoColor=white&style=for-the-badge)](https://discord.byalex.gg/)

</div>

## ✨ Features

- 🎫 **Multiple Ticket Categories**
  - Create different ticket types for various support needs
  - Customizable category names and descriptions
  - Support role assignments per category

- 🔒 **Advanced Ticket Management**
  - Ticket creation with custom questions
  - Ticket closure with confirmation
  - Ticket transcripts with HTML formatting
  - Ticket blacklist system

- ⏰ **Working Hours System**
  - Set custom support hours
  - Automatic out-of-hours messages
  - Next working hours display

- 📝 **Customizable Messages**
  - All messages configurable via settings.yml
  - Support for rich embeds and formatting
  - Easy to modify and maintain

- 🔍 **Logging System**
  - Comprehensive logging of all actions
  - Ticket creation, closure, and management logs
  - Error tracking and reporting

- 🎨 **Beautiful UI**
  - Modern and clean interface
  - Customizable colors and themes
  - Responsive button interactions

## 🚀 Getting Started

### Prerequisites

- Node.js v16.9.0 or higher
- MongoDB Atlas account
- Discord Bot Token

### Installation

1. Clone the repository
```bash
git clone https://github.com/developedbyalex/B3Tickets.git
cd B3Tickets
```

2. Install dependencies
```bash
npm install
```

3. Configure your bot
- Copy `settings.yml.example` to `settings.yml`
- Fill in your bot token and MongoDB URI
- Configure other settings as needed

4. Start the bot
```bash
npm start
```

## ⚙️ Configuration

All settings can be configured in `settings.yml`:

```yaml
token: 'YOUR_BOT_TOKEN'
mongodbAtlas: 'YOUR_MONGODB_URI'
ticketCategory: 'CATEGORY_ID'
transcripts:
  enabled: true
  channel: 'CHANNEL_ID'
  footer: 'B3Tickets'
```

## 📚 Documentation

For detailed documentation, visit our [Wiki](https://github.com/developedbyalex/B3Tickets/wiki)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - The Discord API library
- [MongoDB](https://www.mongodb.com/) - The database
- All contributors and supporters

## 🔗 Links

- [GitHub Repository](https://github.com/developedbyalex/B3Tickets)
- [Discord Server](https://discord.byalex.gg/)
- [Documentation](https://github.com/developedbyalex/B3Tickets/wiki)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/developedbyalex">Alex</a>
</div> 