const { EmbedBuilder } = require('discord.js');

const TARGET_MEMBER_COUNT = 100; // Hedeflenen üye sayısı

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
        const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (!channel) return;

        const accountCreationDate = member.user.createdAt;
        const now = new Date();
        const diffTime = Math.abs(now - accountCreationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const riskLevel = diffDays < 7 ? 'Yüksek' : 'Düşük';
        const memberCount = member.guild.memberCount;
        const remaining = TARGET_MEMBER_COUNT - memberCount;

        const embed = new EmbedBuilder()
            .setColor(0x57F287) // Discord yeşili (Katıldığında)
            .setAuthor({ 
                name: `${member.user.username} | ${member.id}`, 
                iconURL: member.user.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription('**Sunucuya katıldı!**')
            .addFields(
                { name: '• Kullanıcı', value: `<@${member.id}>`, inline: true },
                { name: '• Risk Seviyesi', value: riskLevel, inline: true },
                { name: '• Sunucudaki Üye Sayısı', value: `${memberCount}`, inline: true },
                { name: '• Hedeflenen Üye Sayısı', value: `${memberCount}/${TARGET_MEMBER_COUNT}`, inline: true },
                { name: '• Hesap Oluşturulma Tarihi', value: `${accountCreationDate.toLocaleDateString('tr-TR')} | ${Math.floor(diffDays / 365)} yıl önce`, inline: false }
            )
            .setImage('https://media4.giphy.com/media/v1.Y2lkPTZjMDliPTZjMDliOTUyYmxpYnVoY2trYjI1b3I1aDRlNXVpYmVmODFvMG9xMnFxZjZicWtnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KUiRNSE9b3eKI/giphy.gif')
            .setTimestamp();

        await channel.send({
            content: `<@${member.id}> Merhaba, Sunucumuza hoşgeldin!\nHedef: ${TARGET_MEMBER_COUNT} • Üye Sayısı: ${memberCount} • Kalan: ${remaining > 0 ? remaining : 0}`,
            embeds: [embed]
        });
    },
};