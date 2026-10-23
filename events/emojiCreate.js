const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'emojiCreate',
    async execute(emoji) {
        const logChannel = emoji.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await emoji.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.EmojiCreate });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === emoji.id) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('😀 Yeni Emoji Eklendi')
            .addFields(
                { name: '📌 Emoji', value: `${emoji} (\`:${emoji.name}:\`)`, inline: true },
                { name: '👑 Ekleyen Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};