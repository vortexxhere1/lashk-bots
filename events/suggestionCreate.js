const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Öneri kanalının ID'sini buraya yazın
const SUGGESTION_CHANNEL_ID = 'ONERI_KANAL_ID_BURAYA';

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || message.channel.id !== SUGGESTION_CHANNEL_ID) return;

        // Kullanıcının attığı mesajı silip şık kart oluşturalım
        const suggestionText = message.content;
        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('💡 Yeni Öneri / İstek')
            .setDescription(suggestionText)
            .addFields(
                { name: '👤 Gönderen', value: `<@${message.author.id}> (\`${message.author.tag}\`)`, inline: true },
                { name: '📊 Durum', value: 'Değerlendirmede...', inline: true }
            )
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('suggest_yes')
                .setLabel('0')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('suggest_no')
                .setLabel('0')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};