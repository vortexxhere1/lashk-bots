const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'autoModActionExecution',
    async execute(autoModAction) {
        const logChannel = autoModAction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('🤖 AutoMod Filtresi Devreye Girdi')
            .addFields(
                { name: '👤 Kullanıcı', value: `<@${autoModAction.userId}>`, inline: true },
                { name: '📌 Kanal', value: `<#${autoModAction.channelId}>`, inline: true },
                { name: '⚡ Eylem', value: `\`${autoModAction.action.type}\``, inline: true },
                { name: '📝 Eşleşen İçerik / Kural', value: `Kural ID: \`${autoModAction.ruleId}\``, inline: false }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};