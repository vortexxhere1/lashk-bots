const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enayi')
        .setDescription('Kullanıcının enayilik oranını hesaplar.')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Enayilik oranı ölçülecek kişi')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('kullanici') || interaction.user;
        const percentage = Math.floor(Math.random() * 101); // 0 - 100 arası rastgele

        // Yüzde çubuğu görseli (10 parça)
        const filledBlocks = Math.round(percentage / 10);
        const emptyBlocks = 10 - filledBlocks;
        const progressBar = '🟨'.repeat(filledBlocks) + '⬛'.repeat(emptyBlocks);

        // Orana göre eğlenceli espriler
        let comment = '';
        if (percentage < 20) {
            comment = 'Bu kişi tam bir uyanık! Kanmıyor, kandıramazsın. 😎';
        } else if (percentage < 50) {
            comment = 'Normal seviyede, arada bir ufak enayilikler yapabiliyor.';
        } else if (percentage < 80) {
            comment = 'Bayağı bir enayilik var gibi... Dikkat et kendine! 🤡';
        } else {
            comment = 'TEBRİKLER! Safkan, tescilli enayi ilan edildin! 🥳🎭';
        }

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle(`🤡 Enayi Ölçer | ${target.username}`)
            .setDescription(`**Enayilik Yüzdesi: %${percentage}**\n${progressBar}\n\n${comment}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};