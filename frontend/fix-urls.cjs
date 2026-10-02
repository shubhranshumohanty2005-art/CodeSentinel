const fs = require('fs');
const path = 'D:/PROJECT/test/DevLog AI2/frontend/public/landing-pages/kage.html';
let src = fs.readFileSync(path, 'utf8');

src = src.replace(/https:\/\/ublctyddhtbgaersvxxb\.supabase\.co\/storage\/v1\/object\/public\/threeui-media\/scene-images\/[a-f0-9]+\/(kage-[a-z0-9-]+)\.webp/g, 'secret-pathways-assets/generated/$1.webp');

src = src.replace(/https:\/\/ublctyddhtbgaersvxxb\.supabase\.co\/storage\/v1\/object\/public\/threeui-media\/scene-images\/[a-f0-9]+\/([a-z0-9-]+)\.webp/g, 'secret-pathways-assets/foreground/png/$1.webp');

fs.writeFileSync(path, src, 'utf8');
console.log('URLs replaced successfully.');
