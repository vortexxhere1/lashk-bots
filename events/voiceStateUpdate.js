const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const logChannel = newState.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const member = newState.member;

        // Odaya Katılma
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🔊 Sese Katıldı')
                .addFields(
                    { name: '👤 Üye', value: `${member} (\`${member.user.tag}\`)`, inline: true },
                    { name: '📌 Kanal', value: `${newState.channel}`, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }

        // Odadan Ayrılma
        if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('🔇 Sesten Ayrıldı')
                .addFields(
                    { name: '👤 Üye', value: `${member} (\`${member.user.tag}\`)`, inline: true },
                    { name: '📌 Ayrıldığı Kanal', value: `${oldState.channel}`, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }

        // Oda Değiştirme
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('🔀 Ses Kanalı Değiştirdi')
                .addFields(
                    { name: '👤 Üye', value: `${member} (\`${member.user.tag}\`)`, inline: true },
                    { name: '❌ Eski Kanal', value: `${oldState.channel}`, inline: true },
                    { name: '✅ Yeni Kanal', value: `${newState.channel}`, inline: true }
                )
                .setTimestamp();
            return logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    }
};