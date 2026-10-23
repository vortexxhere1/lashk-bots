module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Botların kendi mesajlarına veya diğer botlara yanıt vermesini engelle
        if (message.author.bot) return;

        // Mesajı küçük harfe çevirip Türkçe karakterleri ve ekstra boşlukları düzeltelim
        const content = message.content
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .trim();

        // 1. MERHABA
        const merhabaRegex = /^(mrhb|mrb|mrh|meraba|merhaba|merhabalaar|merhabalar)$/i;
        if (merhabaRegex.test(content)) {
            return message.reply(`Merhaba,**<@${message.author.id}> Hoşgeldin!**`);
        }

        // 2. SELAM
        const selamRegex = /^(slm|selam|selamm|selamlar|slmlar)$/i;
        if (selamRegex.test(content)) {
            return message.reply(`Selam,**Hoşgeldin <@${message.author.id}>**`);
        }

        // 3. SELAMÜN ALEYKÜM
        const saRegex = /^(sa|s\.a|s\.a\.|selamunaleykum|selamun aleykum|selaminaleykum|selamin aleykum|selamun aleykuum|sa cumleten|sa hoke)$/i;
        if (saRegex.test(content)) {
            return message.reply(`Aleykümselam,**Hoşgeldin <@${message.author.id}>**`);
        }

        // 4. İYİ GECELER
        const iyiGecelerRegex = /^(iyi geceler|ii geceler|iyi gceler|iyi gcler|ii gck|ig|iyi geceler herkese)$/i;
        if (iyiGecelerRegex.test(content)) {
            return message.reply(`Sanada iyigeceler,**<@${message.author.id}>**`);
        }

        // 5. GÜNAYDIN
        const gunaydinRegex = /^(gunaydin|gunaydn|gnydn|gn3|ii sabahlar|iyi sabahlar)$/i;
        if (gunaydinRegex.test(content)) {
            return message.reply(`Günaydın,**<@${message.author.id}>**`);
        }

        // 6. TÜNAYDIN
        const tunaydinRegex = /^(tunaydin|tunaydn|tnydn)$/i;
        if (tunaydinRegex.test(content)) {
            return message.reply(`Tünaydın,**<@${message.author.id}>**`);
        }
    },
};