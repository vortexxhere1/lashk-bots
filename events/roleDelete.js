const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        const logChannel = role.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🗑️ Rol Silindi')
            .addFields(
                { name: '📌 Rol Adı', value: `\`${role.name}\``, inline: true },
                { name: '👑 Silen Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};