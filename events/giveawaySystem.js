const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // --- ÖNERİ BUTONLARI (EVET / HAYIR) ---
        if (interaction.isButton() && (interaction.customId === 'suggest_yes' || interaction.customId === 'suggest_no')) {
            const message = interaction.message;
            const embed = EmbedBuilder.from(message.embeds[0]);
            
            const yesButton = ButtonBuilder.from(message.components[0].components[0]);
            const noButton = ButtonBuilder.from(message.components[0].components[1]);

            let yesCount = parseInt(yesButton.data.label) || 0;
            let noCount = parseInt(noButton.data.label) || 0;

            if (interaction.customId === 'suggest_yes') yesCount++;
            if (interaction.customId === 'suggest_no') noCount++;

            yesButton.setLabel(`${yesCount}`);
            noButton.setLabel(`${noCount}`);

            const updatedRow = new ActionRowBuilder().addComponents(yesButton, noButton);

            await message.edit({ embeds: [embed], components: [updatedRow] });
            return interaction.reply({ content: 'Oyunuz kaydedildi!', ephemeral: true });
        }
    }
};