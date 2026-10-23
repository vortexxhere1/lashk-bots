const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekilis')
        .setDescription('Yeni bir çekiliş başlatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('odul')
                .setDescription('Çekiliş ödülü nedir?')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('sure')
                .setDescription('Çekiliş süresi (dakika olarak)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('kazanan_sayisi')
                .setDescription('Kaç kişi kazanacak?')
                .setRequired(false)),

    async execute(interaction) {
        const prize = interaction.options.getString('odul');
        const durationMinutes = interaction.options.getInteger('sure');
        const winnerCount = interaction.options.getInteger('kazanan_sayisi') || 1;

        const endTime = Date.now() + durationMinutes * 60 * 1000;
        const participants = new Set();

        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle(`🎉 ÇEKİLİŞ: ${prize}`)
            .setDescription(`Katılmak için aşağıdaki **Katıl** butonuna tıklayın!\n\n⏱️ **Bitiş:** <t:${~~(endTime / 1000)}:R>\n👑 **Kazanan Sayısı:** ${winnerCount}`)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_join')
                .setLabel('Katıl (0)')
                .setEmoji('🎉')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ content: '🎉 Çekiliş başarıyla başlatıldı!', ephemeral: true });
        const giveawayMsg = await interaction.channel.send({ embeds: [embed], components: [row] });

        const collector = giveawayMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: durationMinutes * 60 * 1000
        });

        collector.on('collect', async i => {
            if (i.customId === 'giveaway_join') {
                if (participants.has(i.user.id)) {
                    return i.reply({ content: 'Çekilişe zaten katıldınız!', ephemeral: true });
                }
                participants.add(i.user.id);

                const updatedRow = new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(i.message.components[0].components[0]).setLabel(`Katıl (${participants.size})`)
                );
                await i.message.edit({ components: [updatedRow] });
                await i.reply({ content: 'Çekilişe başarıyla katıldınız! Bol şans 🍀', ephemeral: true });
            }
        });

        collector.on('end', async () => {
            const participantArray = Array.from(participants);
            if (participantArray.length === 0) {
                return interaction.channel.send(`🎉 **${prize}** çekilişi sona erdi, ancak yeterli katılım olmadı.`);
            }

            const winners = [];
            for (let i = 0; i < Math.min(winnerCount, participantArray.length); i++) {
                const randomIndex = Math.floor(Math.random() * participantArray.length);
                winners.push(participantArray.splice(randomIndex, 1)[0]);
            }

            const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
            const endEmbed = EmbedBuilder.from(giveawayMsg.embeds[0])
                .setColor(0x57F287)
                .setDescription(`🎉 **Çekiliş Sona Erdi!**\n🎁 **Ödül:** ${prize}\n👑 **Kazananlar:** ${winnerMentions}`);

            await giveawayMsg.edit({ embeds: [endEmbed], components: [] });
            await interaction.channel.send(`🎉 Tebrikler ${winnerMentions}! **${prize}** çekilişini kazandınız!`);
        });
    }
};