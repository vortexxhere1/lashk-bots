const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author?.bot || oldMessage.content === newMessage.content) return;
        const logChannel = newMessage.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('✏️ Mesaj Düzenlendi')
            .addFields(
                { name: '👤 Mesaj Sahibi', value: `<@${newMessage.author.id}> (\`${newMessage.author.tag}\`)`, inline: true },
                { name: '📌 Kanal', value: `${newMessage.channel}`, inline: true },
                { name: '❌ Eski', value: oldMessage.content || '*[Yok]*', inline: false },
                { name: '✅ Yeni', value: newMessage.content || '*[Yok]*', inline: false }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};