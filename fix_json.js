const fs = require('fs');
const path = require('path');

const locales = ['en', 'bg', 'es', 'ja', 'zh'];
const keysToMove = ['statsLabels', 'class', 'plan', 'language', 'dangerZone'];

locales.forEach(locale => {
    const filePath = path.join(__dirname, 'messages', `${locale}.json`);
    if (!fs.existsSync(filePath)) return;

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let modified = false;
        if (!data.profile) {
            data.profile = {};
        }

        keysToMove.forEach(key => {
            if (data[key]) {
                data.profile[key] = data[key];
                delete data[key];
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Fixed profile keys in ${locale}.json`);
        }
    } catch (e) {
        console.error(`Error parsing ${locale}.json:`, e);
    }
});
