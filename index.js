require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Collection, REST, Routes } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Render.com için mini Express sunucusu
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord Bot aktif ve çalışıyor!');
});

app.listen(PORT, () => {
    console.log(`Web sunucusu ${PORT} portunda çalışıyor.`);
});

// Discord Bot İstemcisi ve Intent'ler
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates // Ses kanalı durumları için
    ]
});

const TICKET_CHANNEL_ID = '1556018661590835200';

// --- KOMUT YÜKLEYİCİ (COMMANDS) ---
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

// --- OLAY (EVENTS) YÜKLEYİCİ ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// --- MONGODB BAĞLANTISI ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB veritabanına başarıyla bağlanıldı!');
    })
    .catch((err) => {
        console.error('❌ MongoDB bağlantı hatası:', err);
    });

// --- 7/24 SES KANALI BAĞLANTI FONKSİYONU ---
async function connectToVoiceChannel() {
    const channelId = process.env.VOICE_CHANNEL_ID;
    if (!channelId) return;

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,  // Kulaklığı kapatır
            selfMute: false
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                connection.destroy();
                connectToVoiceChannel(); // Koparsa tekrar bağlan
            }
        });

        console.log(`🔊 Ses kanalına 7/24 bağlanıldı: ${channel.name}`);
    } catch (error) {
        console.error('Ses kanalına bağlanırken hata oluştu:', error);
    }
}

// --- BOT HAZIR OLDUĞUNDA ---
client.once('ready', async () => {
    console.log(`Bot aktif: ${client.user.tag}`);

    // Ses kanalına 7/24 bağlan
    connectToVoiceChannel();

    // Slash Komutlarını Discord API'ye Kaydetme
    if (commands.length > 0) {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        try {
            console.log('Slash komutları kaydediliyor...');
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            console.log('Slash komutları başarıyla yüklendi!');
        } catch (error) {
            console.error('Komut yükleme hatası:', error);
        }
    }

    // Ticket Paneli Gönderme
    try {
        const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🎟️ Ticket Sistemi / Ticket System')
                .setDescription('🔥 Destek almak için aşağıdaki menüden bir kategori seçin.');

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_select')
                    .setPlaceholder('Ticket oluşturmak için bir kategori seçin')
                    .addOptions([
                        {
                            label: 'Klan Sorunları',
                            value: 'klan_sorunlari',
                            emoji: '⚔️',
                        },
                        {
                            label: 'Yetkili Sorunları',
                            value: 'yetkili_sorunlari',
                            emoji: '👮',
                        },
                        {
                            label: 'Şikayet',
                            value: 'sikayet',
                            emoji: '⚠️',
                        },
                        {
                            label: 'Bilgi',
                            value: 'bilgi',
                            emoji: '📋',
                        },
                    ]),
            );

            await channel.send({ embeds: [embed], components: [row] });
            console.log('Ticket paneli kanala başarıyla gönderildi.');
        }
    } catch (error) {
        console.error('Ticket paneli gönderilirken hata oluştu:', error);
    }
});

client.login(process.env.TOKEN);