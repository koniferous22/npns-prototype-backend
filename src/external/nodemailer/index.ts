import templates, { NodemailerTemplateType } from './templates'
import transporter from './transporter'

type SendMailParams = {
	token: string;
}

export {
	NodemailerTemplateType
}

export default {
	templates,
	sendMail: (recipient: string, template: NodemailerTemplateType , params: SendMailParams) => {
		const email = {
        	from: 'noreply@npns.biz',
        	to: recipient,
        	...template({ ...params, frontendAdress: process.env.FRONTEND_EMAIL_LINK })
    	}
    	return transporter.sendMail(email)
	}
}
