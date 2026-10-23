const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const logChannel = newMember.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        // Denetim kaydından işlemi yapan yetkiliyi bulma
        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1 });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === newMember.id && (Date.now() - auditLog.createdTimestamp) < 5000) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        // 1. Rol Güncellemeleri
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        if (addedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🛡️ Üyeye Rol Verildi')
                .addFields(
                    { name: '👤 Üye', value: `${newMember} (\`${newMember.user.tag}\`)`, inline: true },
                    { name: '👑 Veren Yetkili', value: `${executor}`, inline: true },
                    { name: '➕ Verilen Rol', value: addedRoles.map(r => `${r}`).join(', '), inline: false }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }

        if (removedRoles.size > 0) {
            const embed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('🛡️ Üyeden Rol Alındı')
                .addFields(
                    { name: '👤 Üye', value: `${newMember} (\`${newMember.user.tag}\`)`, inline: true },
                    { name: '👑 Alan Yetkili', value: `${executor}`, inline: true },
                    { name: '➖ Alınan Rol', value: removedRoles.map(r => `${r}`).join(', '), inline: false }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }

        // 2. Takma Ad (Nick) Değişimi
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('✏️ Kullanıcı İsmi / Nick Değişti')
                .addFields(
                    { name: '👤 Üye', value: `${newMember} (\`${newMember.user.tag}\`)`, inline: true },
                    { name: '❌ Eski Nick', value: `\`${oldMember.nickname || oldMember.user.username}\``, inline: true },
                    { name: '✅ Yeni Nick', value: `\`${newMember.nickname || newMember.user.username}\``, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }

        // 3. Zamanaşımı (Timeout) Tespiti
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
            const isTimedOut = newMember.isCommunicationDisabled();
            const embed = new EmbedBuilder()
                .setColor(isTimedOut ? 0xED4245 : 0x57F287)
                .setTitle(isTimedOut ? '⏳ Üyeye Zamanaşımı (Timeout) Verildi' : '⏱️ Üyenin Zamanaşımı Kaldırıldı')
                .addFields(
                    { name: '👤 Üye', value: `${newMember} (\`${newMember.user.tag}\`)`, inline: true },
                    { name: '👑 Yetkili', value: `${executor}`, inline: true },
                    { name: '🕒 Durum', value: isTimedOut ? `Bitiş: <t:${~~(newMember.communicationDisabledUntilTimestamp / 1000)}:F>` : 'Zamanaşımı sona erdi/kaldırıldı', inline: false }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    }
};