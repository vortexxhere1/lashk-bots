const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageDeleteBulk',
    async execute(messages) {
        const firstMessage = messages.first();
        if (!firstMessage || !firstMessage.guild) return;
        
        const logChannel = firstMessage.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🧹 Toplu Mesaj Silindi (Purge)')
            .addFields(
                { name: '📌 Kanal', value: `${firstMessage.channel}`, inline: true },
                { name: '💬 Silinen Mesaj Sayısı', value: `\`${messages.size} adet\``, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};