const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (!message.guild || message.author?.bot) return;
        const logChannel = message.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        let executor = 'Mesaj Sahibi';
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageDelete });
            const auditLog = fetchedLogs.entries.first();
            if (auditLog && auditLog.target.id === message.author.id && (Date.now() - auditLog.createdTimestamp) < 5000) {
                executor = `<@${auditLog.executor.id}> (\`${auditLog.executor.tag}\`)`;
            }
        } catch (e) {}

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🗑️ Mesaj Silindi')
            .addFields(
                { name: '👤 Mesaj Sahibi', value: `<@${message.author.id}> (\`${message.author.tag}\`)`, inline: true },
                { name: '📌 Kanal', value: `${message.channel}`, inline: true },
                { name: '🛡️ Silen/Sorumlu', value: `${executor}`, inline: true },
                { name: '💬 İçerik', value: message.content ? (message.content.length > 1024 ? message.content.slice(0, 1021) + '...' : message.content) : '*[Görsel / Dosya / Embed]*', inline: false }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};