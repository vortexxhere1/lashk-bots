const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'inviteDelete',
    async execute(invite) {
        if (!invite.guild) return;
        const logChannel = invite.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0xED4245) // Kırmızı
            .setTitle('🔗 Davet Bağlantısı Silindi / İptal Edildi')
            .addFields(
                { name: '🔑 Davet Kodu', value: `\`${invite.code}\``, inline: true },
                { name: '📌 Kanal', value: `${invite.channel}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};