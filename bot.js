const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

client.commands = new Collection();

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandsData = [];
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  commandsData.push({ name: command.data.name, description: command.data.description });
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (file === 'ready.js') {
    client.once('ready', () => event(client));
  } else if (file === 'interactionCreate.js') {
    client.on('interactionCreate', interaction => event(client, interaction));
  }
}

// Registrar comandos de barra
const rest = new REST({ version: '10' }).setToken(config.token);
async function registerCommands() {
  try {
    const appId = (await rest.get(Routes.oauth2CurrentApplication())).id;
    await rest.put(
      Routes.applicationCommands(appId),
      { body: commandsData.map(cmd => ({ name: cmd.name, description: cmd.description })) }
    );
    console.clear();
    console.log('\x1b[32m[DEV] Desenvolvido por underleaks\x1b[0m');
    console.log('\x1b[32m[DEV] https://github.com/underleaks\x1b[0m');
    console.log('\x1b[32m[DEV] https://discord.gg/16mvazamentos\x1b[0m');
    console.log('');
    console.log('\x1b[34m[BOT] Comandos  registrados!\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[BOT] Erro ao registrar comandos:\x1b[0m', err);
  }
}

registerCommands().then(() => {
  client.login(config.token);
});