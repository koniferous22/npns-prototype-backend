import nodemailer from 'nodemailer'

const transporter = (process.env.NODE_ENV === 'production') ? 
		nodemailer.createTransport({
			service: 'SendGrid',
			auth: {
				user: process.env.NODEMAILER_USER,
				pass: process.env.NODEMAILER_PASSWORD
			}
		})
	: 	nodemailer.createTransport({
		    host: process.env.NODEMAILER_HOST,
		    port: process.env.NODEMAILER_PORT,
		    secure: false,
		    auth: {
		        user: process.env.NODEMAILER_USER,
		        pass: process.env.NODEMAILER_PASSWORD
		    }
		 });

export default transporter
