const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Kullanıcının aşk oranını ölçer.')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Aşkını ölçmek istediğiniz kişi')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('kullanici') || interaction.user;
        const percentage = Math.floor(Math.random() * 101); // 0 - 100 arası rastgele

        // Kalp çubuğu görseli oluşturma (10 parça)
        const redHearts = Math.round(percentage / 10);
        const blackHearts = 10 - redHearts;
        const heartBar = '❤️'.repeat(redHearts) + '🖤'.repeat(blackHearts);

        // Orana göre esprili yorumlar
        let comment = '';
        if (percentage < 20) {
            comment = 'Bazen Diyorum Ki Bunun İçinmi Üretilmiş :)) Unut Gitsin.';
        } else if (percentage < 50) {
            comment = 'Yani... Bir ihtimal var ama çok da umut bağlama.';
        } else if (percentage < 80) {
            comment = 'Fena değil, aranızda tatlı bir elektrik var gibi!';
        } else {
            comment = 'Aşksınız siz! Nikah tarihini ne zaman alıyorsunuz? 🥰';
        }

        const embed = new EmbedBuilder()
            .setColor(0x9333ea)
            .setTitle(`Lashk | ${target.username}`)
            .setDescription(`**AŞK Yüzde: ${percentage}**\n${heartBar}\n\n${comment}`)
            .setImage('https://c.tenor.com/JR6q0Nvzr_wAAAAC/baby-yoda.gif')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};