const templates = require('./templates')
const transporter = require('./transporter')

module.exports = {
	templates,
	sendMail: (recipient, template, params) => {
		const email = {
        	from: 'noreply@npns.biz',
        	to: recipient,
        	...template({ ...params, frontendAdress: process.env.FRONTEND_EMAIL_LINK })
    	}
    	return transporter.sendMail(email)
	}
}
