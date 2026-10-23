const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel) {
        if (!newChannel.guild) return;
        const logChannel = newChannel.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await newChannel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === newChannel.id && (Date.now() - auditLog.createdTimestamp) < 5000) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C) // Sarı (Güncelleme rengi)
            .setTitle('🛠️ Kanal Güncellendi')
            .addFields(
                { name: '📌 Kanal', value: `${newChannel} (\`${newChannel.name}\`)`, inline: true },
                { name: '👑 Düzenleyen Yetkili', value: `${executor}`, inline: true }
            )
            .setTimestamp();

        if (oldChannel.name !== newChannel.name) {
            embed.addFields({ name: '✏️ İsim Değişikliği', value: `Eski: \`${oldChannel.name}\` ➔ Yeni: \`${newChannel.name}\``, inline: false });
        } else if (oldChannel.topic !== newChannel.topic) {
            embed.addFields({ name: '📝 Konu Değişikliği', value: `Eski: \`${oldChannel.topic || 'Yok'}\` ➔ Yeni: \`${newChannel.topic || 'Yok'}\``, inline: false });
        } else if (oldChannel.permissionOverwrites.cache.size !== newChannel.permissionOverwrites.cache.size) {
            embed.addFields({ name: '🔒 İzin Değişikliği', value: 'Kanalın yetki / erişim izinleri (overwrites) güncellendi!', inline: false });
        } else {
            embed.addFields({ name: '⚙️ Detay', value: 'Kanal ayarlarında bir güncelleme yapıldı.', inline: false });
        }

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};