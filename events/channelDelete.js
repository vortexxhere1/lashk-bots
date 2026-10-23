const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return;
        const logChannel = channel.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xED4245) // Kırmızı
            .setTitle('🗑️ Kanal Silindi')
            .addFields(
                { name: '📌 Kanal Adı', value: `\`${channel.name}\``, inline: true },
                { name: '👑 Silen Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};