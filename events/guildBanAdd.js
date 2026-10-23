const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban) {
        const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        let reason = ban.reason || 'Sebep Belirtilmedi';

        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === ban.user.id) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔨 Üye Yasaklandı (Ban)')
            .addFields(
                { name: '👤 Yasaklanan', value: `<@${ban.user.id}> (\`${ban.user.tag}\`)`, inline: true },
                { name: '👑 Yasaklayan Yetkili', value: `${executor}`, inline: true },
                { name: '📝 Sebep', value: `\`${reason}\``, inline: false }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};