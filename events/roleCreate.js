const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'roleCreate',
    async execute(role) {
        const logChannel = role.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleCreate });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === role.id) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('➕ Yeni Rol Oluşturuldu')
            .addFields(
                { name: '📌 Rol', value: `${role} (\`${role.name}\`)`, inline: true },
                { name: '👑 Oluşturan Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};