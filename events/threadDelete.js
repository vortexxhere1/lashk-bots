const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'threadDelete',
    async execute(thread) {
        const logChannel = thread.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🗑️ Alt Başlık / Thread Silindi')
            .addFields(
                { name: '📌 Başlık Adı', value: `\`${thread.name}\``, inline: true },
                { name: '📁 Bağlı Olduğu Kanal', value: `${thread.parent}`, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};