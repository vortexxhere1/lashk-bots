const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild) {
        const logChannel = newGuild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await newGuild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.GuildUpdate });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('⚙️ Sunucu Ayarları Değiştirildi')
            .addFields({ name: '👤 Değiştiren Yetkili', value: `${executor}`, inline: false })
            .setTimestamp();

        if (oldGuild.name !== newGuild.name) {
            embed.addFields({ name: '✏️ İsim Değişikliği', value: `Eski: \`${oldGuild.name}\` ➔ Yeni: \`${newGuild.name}\``, inline: false });
        }
        if (oldGuild.icon !== newGuild.icon) {
            embed.addFields({ name: '🖼️ İkon Değişikliği', value: 'Sunucu simgesi/örneği değiştirildi.', inline: false });
        }

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};