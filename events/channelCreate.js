const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'channelCreate',
    async execute(channel) {
        if (!channel.guild) return;
        const logChannel = channel.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === channel.id && (Date.now() - auditLog.createdTimestamp) < 5000) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0x57F287) // Yeşil
            .setTitle('📁 Yeni Kanal Oluşturuldu')
            .addFields(
                { name: '📌 Kanal', value: `${channel} (\`${channel.name}\`)`, inline: true },
                { name: '👑 Oluşturan Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};