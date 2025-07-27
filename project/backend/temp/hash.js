const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = '123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Generated Hash:', hashedPassword);
}

generateHash();