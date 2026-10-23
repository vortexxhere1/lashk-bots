const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');

const CATEGORY_ID = '1556018337560141894';
const TRANSCRIPT_CHANNEL_ID = '1556018720026140732';

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            // --- 1. SLASH KOMUTLARI ÇALIŞTIRICI (/cekilis vb.) ---
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (command) {
                    await command.execute(interaction);
                    return;
                }
            }

            // --- 2. TICKET OLUŞTURMA (SELECT MENU) ---
            if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
                await interaction.deferReply({ ephemeral: true });
                
                const guild = interaction.guild;
                const member = interaction.member;
                const selectedValue = interaction.values[0];

                let categoryName = 'destek';
                let categoryDisplayName = 'Destek';
                if (selectedValue === 'klan_sorunlari') { categoryName = 'klan'; categoryDisplayName = 'Klan Sorunları'; }
                else if (selectedValue === 'yetkili_sorunlari') { categoryName = 'yetkili'; categoryDisplayName = 'Yetkili Sorunları'; }
                else if (selectedValue === 'sikayet') { categoryName = 'sikayet'; categoryDisplayName = 'Şikayet'; }
                else if (selectedValue === 'bilgi') { categoryName = 'bilgi'; categoryDisplayName = 'Bilgi'; }

                const channel = await guild.channels.create({
                    name: `${categoryName}-${member.user.username}`,
                    type: ChannelType.GuildText,
                    parent: CATEGORY_ID,
                    topic: `owner:${member.id}|category:${categoryDisplayName}`,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: member.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                    ],
                });

                const ticketEmbed = new EmbedBuilder()
                    .setColor(0x9333ea)
                    .setTitle('🎟️ Destek Talebi Oluşturuldu')
                    .setDescription(`Merhaba <@${member.id}>,\nYetkililerimiz en kısa sürede sizinle ilgilenecektir.\nTalebi kapatmak için aşağıdaki **Kapat** butonunu kullanabilirsiniz.`)
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Talebi Kapat')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

                await channel.send({
                    content: `<@${member.id}> | Yetkililer bilgilendirildi.`,
                    embeds: [ticketEmbed],
                    components: [row]
                });

                await interaction.editReply({ content: `Destek kanalınız başarıyla oluşturuldu: <#${channel.id}>`, ephemeral: true });
            }

            // --- 3. TICKET KAPATMA VE HTML TRANSCRIPT ---
            if (interaction.isButton() && interaction.customId === 'close_ticket') {
                await interaction.reply({ content: 'Destek talebi kapatılıyor ve HTML transcript kaydediliyor...', ephemeral: true });

                const channel = interaction.channel;
                const guild = interaction.guild;
                const client = interaction.client;
                const transcriptChannel = guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID);

                let ownerId = '';
                let categoryDisplayName = 'Bilgi';
                if (channel.topic) {
                    const parts = channel.topic.split('|');
                    for (const p of parts) {
                        if (p.startsWith('owner:')) ownerId = p.replace('owner:', '');
                        if (p.startsWith('category:')) categoryDisplayName = p.replace('category:', '');
                    }
                }
                if (!ownerId) {
                    const overwrites = channel.permissionOverwrites.cache;
                    for (const [id, overwrite] of overwrites) {
                        if (id !== guild.id && id !== client.user.id && overwrite.allow.has(PermissionFlagsBits.ViewChannel)) {
                            ownerId = id;
                            break;
                        }
                    }
                }

                const ownerUser = await client.users.fetch(ownerId).catch(() => null);
                const ownerTag = ownerUser ? ownerUser.tag : channel.name;
                const closer = interaction.user;

                const messages = await channel.messages.fetch({ limit: 100 });
                const sortedMessages = Array.from(messages.values()).reverse();

                let htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Transcript - 📌 ${channel.name}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0f0f23; color: #fff; padding: 20px; }
        .msg { background: #1a1a2e; padding: 10px 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #9333ea; }
        .author { font-weight: bold; color: #a855f7; }
        .time { font-size: 0.8em; color: #888; margin-left: 10px; }
        p { margin: 5px 0 0 0; word-break: break-word; }
    </style>
</head>
<body>`;

                for (const m of sortedMessages) {
                    const timeStr = new Date(m.createdTimestamp).toLocaleString('tr-TR');
                    htmlContent += `
    <div class="msg">
        <span class="author">${m.author.tag}</span><span class="time">${timeStr}</span>
        <p>${m.content ? m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '[Medya veya Embed dosyası]'}</p>
    </div>`;
                }

                htmlContent += `
</body>
</html>`;

                const buffer = Buffer.from(htmlContent, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.html` });

                const createdAt = channel.createdAt;
                const now = new Date();
                const diffMs = now - createdAt;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' };
                const formattedDate = createdAt.toLocaleDateString('tr-TR', dateOptions);

                const transcriptEmbed = new EmbedBuilder()
                    .setColor(0x9333ea)
                    .setTitle('🔒 Ticket Kapatıldı & Transcript')
                    .setDescription(`📌 **${channel.name}** adlı ticket kapatıldı. Mesaj geçmişi dosyası ektedir.`)
                    .addFields(
                        { name: '👤 Ticket Sahibi', value: `${ownerTag}\n(${ownerId || 'Bilinmiyor'})`, inline: true },
                        { name: '🔒 Kapatan Yetkili', value: `${closer.tag}\n(${closer.id})`, inline: true },
                        { name: '📋 Kategori', value: `${categoryDisplayName}`, inline: true },
                        { name: '💬 Toplam Mesaj', value: `${messages.size} mesaj`, inline: true },
                        { name: '⏱️ Açık Kalma Süresi', value: `${diffHours} saat ${diffMins} dakika`, inline: true },
                        { name: '📅 Açılış Tarihi', value: `${formattedDate}`, inline: true }
                    )
                    .setTimestamp();

                if (transcriptChannel) {
                    await transcriptChannel.send({
                        embeds: [transcriptEmbed],
                        files: [attachment]
                    });
                }

                setTimeout(async () => {
                    await channel.delete().catch(() => {});
                }, 3000);
            }

            // --- 4. ÖNERİ SİSTEMİ BUTONLARI (EVET / HAYIR) ---
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

        } catch (error) {
            console.error('Interaction işlem hatası:', error);
            const errorMsg = { content: '❌ İşlem sırasında bir hata oluştu!', ephemeral: true };
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMsg).catch(() => {});
            } else {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    },
};