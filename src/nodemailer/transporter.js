const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: 'oren.cremin@ethereal.email',
        pass: '86GXzmB8sDN2u2Ycuy'
    }
});

module.exports = transporter