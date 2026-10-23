const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildBanRemove',
    async execute(ban) {
        const logChannel = ban.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === ban.user.id) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🔓 Yasak Kaldırıldı (Unban)')
            .addFields(
                { name: '👤 Kullanıcı', value: `<@${ban.user.id}> (\`${ban.user.tag}\`)`, inline: true },
                { name: '👑 Kaldıran Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};