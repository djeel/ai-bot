require('dotenv').config(); // Charge .env
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const readline = require('readline');
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN
});

let bot;
let autoFollow = false;

const config = [
  { username: 'djne', host: '127.0.0.1', port: 25568 }
];

function createBot(i) {
  const { username, host, port } = config[i];
  console.log(`\n🔧 [INIT] Creating ${username}…`);

  bot = mineflayer.createBot({
    username,
    host,
    port,
    auth: 'offline',
    bungee: true
  });

  bot.loadPlugin(pathfinder);

  bot.on('spawn', () => {
    console.log(`✅ ${username} spawned`);
    bot.chat('Ahoy!');
    const defaultMove = new Movements(bot);
    bot.pathfinder.setMovements(defaultMove);

    setInterval(() => {
      if (!autoFollow) return;
      const players = Object.values(bot.players)
        .filter(p => p.username !== bot.username && p.entity)
        .sort((a, b) =>
          bot.entity.position.distanceTo(a.entity.position) -
          bot.entity.position.distanceTo(b.entity.position)
        );
      const target = players[0]?.entity;
      if (target) {
        const goal = new goals.GoalFollow(target, 1);
        bot.pathfinder.setGoal(goal, true);
      }
    }, 200);
  });

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    console.log(`[CHAT] ${username}: ${message}`);
    if (!message.startsWith("@ai")) return;

    const promptRaw = message.slice(3).trim();
    if (!promptRaw) return;
    const prompt = promptRaw.toLowerCase();

    const words = prompt.split(" ");
    const command = words[0];

    // ─── Commandes natives (sans GPT) ──────────────────────────────
    if (prompt === "follow me") {
      const target = bot.players[username]?.entity;
      if (target) {
        const goal = new goals.GoalFollow(target, 1);
        bot.pathfinder.setGoal(goal, true);
        bot.chat(`Following you, ${username}.`);
      } else {
        bot.chat("I can't see you.");
      }
      return;
    }

    if (command === "follow" && words.length >= 2) {
      const targetName = words[1];
      const target = bot.players[targetName]?.entity;
      if (target) {
        const goal = new goals.GoalFollow(target, 1);
        bot.pathfinder.setGoal(goal, true);
        bot.chat(`Following ${targetName}.`);
      } else {
        bot.chat(`Can't find player "${targetName}".`);
      }
      return;
    }

    if (prompt === "stop following") {
      bot.pathfinder.setGoal(null);
      bot.chat("Okay, I stopped.");
      return;
    }

    if (prompt === "come here") {
      const target = bot.players[username]?.entity;
      if (target) {
        const goal = new goals.GoalNear(target.position, 1);
        bot.pathfinder.setGoal(goal);
        bot.chat("Coming to you!");
      } else {
        bot.chat("I can't find you.");
      }
      return;
    }

    // ─── Requête GPT ───────────────────────────────────────────────
    console.log(`[AI REQUEST] ${promptRaw}`);
    try {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a smart and responsive AI assistant for the Gangui Minecraft Network (IP: mc.gangui.eu). Players can interact with you directly through the server chat. Respond concisely in plain text, without markdown, formatting, or code blocks. Messages must not exceed 256 characters, including spaces and punctuation. Gangui features competitive game modes like Duel, FFA Modern, and FFA Legacy, with modern and legacy combat systems (legacy mode disables weapon cooldown and uses classic sword animations). An anonymous mode is available at hidden.gangui.eu, providing a randomized username, no chat access, and support for cracked accounts. The server runs on Minestom for high performance, supports both Java (1.8 & 1.21) and Bedrock players, and allows players to create fully customizable game mode blueprints. Admins: djeel and Tomastore. Server created on 9/28/2023 at 3:14 AM. Join the community on Discord: https://discord.gg/7Kj8vsGdSr. Visit the website: https://gangui.eu."
          },
          { role: "user", content: promptRaw }
        ],
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1
      });
      const reply = response.choices[0].message.content;
      if (reply) {
        console.log(`[AI RESPONSE] ${reply}`);
        bot.chat(reply.slice(0, 255));
      }
    } catch (err) {
      console.error("❌ AI Error:", err.message);
      bot.chat("Sorry, I couldn't process that.");
    }
  });

  bot.on('resourcePackSend', () => bot.rejectResourcePack());
  bot.on('addResourcePack', () => bot.rejectResourcePack());
  bot.on('login', () => console.log(`⏳ Login successful`));
  bot.on('kicked', reason => console.warn(`⛔ Kicked -> ${JSON.stringify(reason)}`));
  bot.on('error', err => console.error(`❌ Error -> ${err.message}`));
  bot.on('end', () => console.log(`🔌 Disconnected`));
}

createBot(0);

// ─── Contrôle clavier (ZQSD/WASD) ────────────────────────────────
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

console.log('🎮 Use ZQSD/WASD to move. Press [F] to toggle follow mode. Ctrl+C to quit.');

process.stdin.on('keypress', (str, key) => {
  if (!bot) return;
  if (key.ctrl && key.name === 'c') {
    console.log('👋 Quitting bot...');
    bot.quit();
    process.exit();
  }
  if (key.name === 'f') {
    autoFollow = !autoFollow;
    bot.clearControlStates();
    bot.pathfinder.setGoal(null);
    console.log(autoFollow ? '✅ Follow mode ON' : '🕹️ Manual mode ON');
    return;
  }
  if (autoFollow) return;
  switch (key.name) {
    case 'z':
    case 'w':
      bot.setControlState('forward', true);
      break;
    case 's':
      bot.setControlState('back', true);
      break;
    case 'q':
    case 'a':
      bot.setControlState('left', true);
      break;
    case 'd':
      bot.setControlState('right', true);
      break;
    case 'space':
      bot.setControlState('jump', true);
      break;
    case 'shift':
      bot.setControlState('sneak', true);
      break;
    case 'up':
      bot.look(bot.entity.yaw, bot.entity.pitch - 0.1);
      break;
    case 'down':
      bot.look(bot.entity.yaw, bot.entity.pitch + 0.1);
      break;
    case 'left':
      bot.look(bot.entity.yaw - 0.1, bot.entity.pitch);
      break;
    case 'right':
      bot.look(bot.entity.yaw + 0.1, bot.entity.pitch);
      break;
  }
  setTimeout(() => bot.clearControlStates(), 200);
});
