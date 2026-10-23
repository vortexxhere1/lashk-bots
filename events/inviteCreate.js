const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'inviteCreate',
    async execute(invite) {
        const logChannel = invite.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🔗 Davet Bağlantısı Oluşturuldu')
            .addFields(
                { name: '👤 Oluşturan', value: `<@${invite.inviter?.id}> (\`${invite.inviter?.tag}\`)`, inline: true },
                { name: '📌 Kanal', value: `${invite.channel}`, inline: true },
                { name: '🔑 Kodu', value: `\`${invite.code}\``, inline: true },
                { name: '⏳ Kullanım / Süre', value: `Max Kullanım: \`${invite.maxUses || 'Sınırsız'}\` | Süre: \`${invite.maxAge ? invite.maxAge + 'sn' : 'Sınırsız'}\``, inline: false }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};