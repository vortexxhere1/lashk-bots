const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Seçtiğiniz kullanıcının profil fotoğrafını veya bannerını gösterir.')
        .addStringOption(option =>
            option.setName('secim')
                .setDescription('Hangi fotoğrafı görmek istiyorsun?')
                .setRequired(true)
                .addChoices(
                    { name: 'Photo', value: 'photo' },
                    { name: 'Banner', value: 'banner' }
                ))
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('Fotoğrafına bakılacak kullanıcı')
                .setRequired(false)),

    async execute(interaction) {
        const choice = interaction.options.getString('secim');
        const target = interaction.options.getUser('kullanici') || interaction.user;

        // Banner bilgisini güvenli çekmek için force fetch yapıyoruz
        const fetchedUser = await interaction.client.users.fetch(target.id, { force: true });

        if (choice === 'photo') {
            const avatarURL = target.displayAvatarURL({ size: 4096, dynamic: true });

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`${target.username} - Avatar`)
                .setImage(avatarURL)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Tarayıcıda Aç')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarURL)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        } 
        else if (choice === 'banner') {
            const bannerURL = fetchedUser.bannerURL({ size: 4096, dynamic: true });

            if (!bannerURL) {
                return interaction.reply({ content: '❌ Bu kullanıcının özel bir banner\'ı bulunmuyor!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`${target.username} - Banner`)
                .setImage(bannerURL)
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Tarayıcıda Aç')
                    .setStyle(ButtonStyle.Link)
                    .setURL(bannerURL)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};