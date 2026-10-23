const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'emojiDelete',
    async execute(emoji) {
        const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await emoji.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.EmojiDelete });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🗑️ Emoji Silindi')
            .addFields(
                { name: '📌 Emoji İsmi', value: `\`:${emoji.name}:\``, inline: true },
                { name: '👑 Silen Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};