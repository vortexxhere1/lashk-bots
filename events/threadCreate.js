const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'threadCreate',
    async execute(thread) {
        const logChannel = thread.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🧵 Alt Başlık / Thread Açıldı')
            .addFields(
                { name: '📌 Başlık', value: `${thread} (\`${thread.name}\`)`, inline: true },
                { name: '📁 Bağlı Olduğu Kanal', value: `${thread.parent}`, inline: true },
                { name: '👤 Oluşturan', value: `<@${thread.ownerId}>`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};