const fs = require('fs');
const path = 'D:/PROJECT/test/DevLog AI2/frontend/public/landing-pages/kage.html';
let src = fs.readFileSync(path, 'utf8');

src = src.replace(/ crossorigin="anonymous"/g, '');
src = src.replace(/this\.crossOrigin="anonymous"/g, 'this.crossOrigin=null');

fs.writeFileSync(path, src, 'utf8');
console.log('Removed crossorigin attributes');
