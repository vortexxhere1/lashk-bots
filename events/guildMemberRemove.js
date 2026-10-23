const { EmbedBuilder } = require('discord.js');

const TARGET_MEMBER_COUNT = 100; // Hedeflenen üye sayısı

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const GOODBYE_CHANNEL_ID = process.env.GOODBYE_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
        if (!channel) return;

        const memberCount = member.guild.memberCount;
        const remaining = TARGET_MEMBER_COUNT - memberCount;

        const embed = new EmbedBuilder()
            .setColor(0xED4245) // Discord kırmızısı (Ayrıldığında)
            .setAuthor({ 
                name: `${member.user.username} | ${member.id}`, 
                iconURL: member.user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription('**Sunucudan ayrıldı!**')
            .addFields(
                { name: '• Kullanıcı', value: `<@${member.id}>`, inline: true },
                { name: '• Sunucudaki Üye Sayısı', value: `${memberCount}`, inline: true },
                { name: '• Hedeflenen Üye Sayısı', value: `${memberCount}/${TARGET_MEMBER_COUNT}`, inline: true }
            )
            .setTimestamp();

        await channel.send({
            content: `— <@${member.id}> ( **${member.user.username}** ) sunucudan **ayrıldı**.\nHedef: ${TARGET_MEMBER_COUNT} • Kalan: ${remaining}`,
            embeds: [embed]
        });
    },
};