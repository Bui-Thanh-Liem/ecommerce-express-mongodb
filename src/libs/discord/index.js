// npm install discord.js

import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import configEnv from "../../config/config.env.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

// ID của channel để gửi logs (tạo channel #logs trong server)
console.log("configEnv:", configEnv);

const LOG_CHANNEL_ID = configEnv.discord.logChannelId;

// Hàm helper để tạo embed
function createLogEmbed(title, description, color, fields = []) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: "Logging System" });

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  return embed;
}

// Hàm gửi log
async function sendLog(guild, embed) {
  try {
    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error("Error sending log:", error);
  }
}

// Bot ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("Monitoring server", { type: "WATCHING" });
});

// ========== MESSAGE LOGS ==========

// Tin nhắn bị xóa
client.on("messageDelete", async (message) => {
  if (message.author.bot) return;

  const embed = createLogEmbed(
    "🗑️ Message Deleted",
    `Message by ${message.author.tag} was deleted`,
    0xff0000,
    [
      {
        name: "Author",
        value: `${message.author.tag} (${message.author.id})`,
        inline: true,
      },
      { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
      {
        name: "Content",
        value: message.content || "*No content*",
        inline: false,
      },
    ]
  );

  console.log("message.guild:", message.guild);

  await sendLog(message.guild, embed);
});

// Tin nhắn được chỉnh sửa
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (newMessage.author.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const embed = createLogEmbed(
    "✏️ Message Edited",
    `Message by ${newMessage.author.tag} was edited`,
    0xffa500,
    [
      {
        name: "Author",
        value: `${newMessage.author.tag} (${newMessage.author.id})`,
        inline: true,
      },
      { name: "Channel", value: `<#${newMessage.channel.id}>`, inline: true },
      {
        name: "Before",
        value: oldMessage.content || "*No content*",
        inline: false,
      },
      {
        name: "After",
        value: newMessage.content || "*No content*",
        inline: false,
      },
      {
        name: "Link",
        value: `[Jump to message](${newMessage.url})`,
        inline: false,
      },
    ]
  );

  await sendLog(newMessage.guild, embed);
});

// ========== MEMBER LOGS ==========

// Member join
client.on("guildMemberAdd", async (member) => {
  const embed = createLogEmbed(
    "📥 Member Joined",
    `${member.user.tag} joined the server`,
    0x00ff00,
    [
      {
        name: "User",
        value: `${member.user.tag} (${member.user.id})`,
        inline: true,
      },
      {
        name: "Account Created",
        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        inline: true,
      },
      {
        name: "Member Count",
        value: `${member.guild.memberCount}`,
        inline: true,
      },
    ]
  );

  if (member.user.avatarURL()) {
    embed.setThumbnail(member.user.avatarURL());
  }

  await sendLog(member.guild, embed);
});

// Member leave
client.on("guildMemberRemove", async (member) => {
  const embed = createLogEmbed(
    "📤 Member Left",
    `${member.user.tag} left the server`,
    0xff0000,
    [
      {
        name: "User",
        value: `${member.user.tag} (${member.user.id})`,
        inline: true,
      },
      {
        name: "Joined At",
        value: member.joinedAt
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
          : "Unknown",
        inline: true,
      },
      {
        name: "Member Count",
        value: `${member.guild.memberCount}`,
        inline: true,
      },
    ]
  );

  if (member.user.avatarURL()) {
    embed.setThumbnail(member.user.avatarURL());
  }

  await sendLog(member.guild, embed);
});

// Member role update
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id));
  const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id));

  if (addedRoles.size > 0 || removedRoles.size > 0) {
    const fields = [
      {
        name: "Member",
        value: `${newMember.user.tag} (${newMember.user.id})`,
        inline: false,
      },
    ];

    if (addedRoles.size > 0) {
      fields.push({
        name: "➕ Added Roles",
        value: addedRoles.map((role) => `<@&${role.id}>`).join(", "),
        inline: false,
      });
    }

    if (removedRoles.size > 0) {
      fields.push({
        name: "➖ Removed Roles",
        value: removedRoles.map((role) => `<@&${role.id}>`).join(", "),
        inline: false,
      });
    }

    const embed = createLogEmbed(
      "👤 Member Roles Updated",
      `Roles changed for ${newMember.user.tag}`,
      0x00ffff,
      fields
    );

    await sendLog(newMember.guild, embed);
  }
});

// ========== BAN/KICK LOGS ==========

// Member banned
client.on("guildBanAdd", async (ban) => {
  const embed = createLogEmbed(
    "🔨 Member Banned",
    `${ban.user.tag} was banned from the server`,
    0x8b0000,
    [
      { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
      {
        name: "Reason",
        value: ban.reason || "No reason provided",
        inline: false,
      },
    ]
  );

  if (ban.user.avatarURL()) {
    embed.setThumbnail(ban.user.avatarURL());
  }

  await sendLog(ban.guild, embed);
});

// Member unbanned
client.on("guildBanRemove", async (ban) => {
  const embed = createLogEmbed(
    "🔓 Member Unbanned",
    `${ban.user.tag} was unbanned`,
    0x00ff00,
    [{ name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true }]
  );

  await sendLog(ban.guild, embed);
});

// ========== VOICE LOGS ==========

// Voice state update
client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member;

  // User joined voice channel
  if (!oldState.channel && newState.channel) {
    const embed = createLogEmbed(
      "🔊 Joined Voice Channel",
      `${member.user.tag} joined a voice channel`,
      0x00ff00,
      [
        {
          name: "User",
          value: `${member.user.tag} (${member.user.id})`,
          inline: true,
        },
        { name: "Channel", value: `${newState.channel.name}`, inline: true },
      ]
    );
    await sendLog(newState.guild, embed);
  }

  // User left voice channel
  if (oldState.channel && !newState.channel) {
    const embed = createLogEmbed(
      "🔇 Left Voice Channel",
      `${member.user.tag} left a voice channel`,
      0xff0000,
      [
        {
          name: "User",
          value: `${member.user.tag} (${member.user.id})`,
          inline: true,
        },
        { name: "Channel", value: `${oldState.channel.name}`, inline: true },
      ]
    );
    await sendLog(oldState.guild, embed);
  }

  // User switched voice channels
  if (
    oldState.channel &&
    newState.channel &&
    oldState.channel.id !== newState.channel.id
  ) {
    const embed = createLogEmbed(
      "🔄 Switched Voice Channel",
      `${member.user.tag} switched voice channels`,
      0xffa500,
      [
        {
          name: "User",
          value: `${member.user.tag} (${member.user.id})`,
          inline: false,
        },
        { name: "From", value: `${oldState.channel.name}`, inline: true },
        { name: "To", value: `${newState.channel.name}`, inline: true },
      ]
    );
    await sendLog(newState.guild, embed);
  }
});

// ========== CHANNEL LOGS ==========

// Channel created
client.on("channelCreate", async (channel) => {
  const embed = createLogEmbed(
    "➕ Channel Created",
    `New channel was created`,
    0x00ff00,
    [
      {
        name: "Channel",
        value: `${channel.name} (<#${channel.id}>)`,
        inline: true,
      },
      { name: "Type", value: channel.type.toString(), inline: true },
    ]
  );

  await sendLog(channel.guild, embed);
});

// Channel deleted
client.on("channelDelete", async (channel) => {
  const embed = createLogEmbed(
    "➖ Channel Deleted",
    `Channel was deleted`,
    0xff0000,
    [
      {
        name: "Channel",
        value: `${channel.name} (${channel.id})`,
        inline: true,
      },
      { name: "Type", value: channel.type.toString(), inline: true },
    ]
  );

  await sendLog(channel.guild, embed);
});

// Login
client.login(configEnv.discord.botToken);
