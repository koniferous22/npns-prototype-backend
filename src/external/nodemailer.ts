import nodemailer from 'nodemailer'
import { configuration } from '../../config';

type NodemailerTemplateArgs = {
  frontendAdress: string;
  token: string;
}

const signUpTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
  const fullAdress = frontendAdress + "confirm/registration/" + token
  return {
    subject: 'NPNS Regoostration code',
    text: 'Copy following address to confirm email:\n' + fullAdress,
    html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your email</p>'
  }
}

const pwdResetTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
  const fullAdress = frontendAdress + "confirm/passwordChange/" + token
  return {
    subject: 'NPNS Password Reset Link',
    text: 'Copy following address to reset ur password:\n' + fullAdress,
    html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your new password</p>'
  }
}

const emailChangeTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
  const fullAdress = frontendAdress + "confirm/emailChange/" + token
  return {
    subject: 'NPNS Email Change Link',
    text: 'Copy following address to confirm email:\n' + fullAdress,
    html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your newly chosen email adventurer</p>'
  }
}

const usernameChangeTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
  const fullAdress = frontendAdress + "confirm/usernameChange/" + token
  return {
    subject: 'NPNS Username Change Link',
    text: 'Copy following address to confirm your new username:\n' + fullAdress,
    html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your new finely chosen username adventurer</p>'
  }
}
const transporter = (process.env.NODE_ENV === 'production')
  ? nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: configuration.external.nodemailer.user,
      pass: configuration.external.nodemailer.password
    }
  })
  : nodemailer.createTransport({
    host: configuration.external.nodemailer.host,
    port: configuration.external.nodemailer.port,
    secure: false,
    auth: {
      user: configuration.external.nodemailer.user,
      pass: configuration.external.nodemailer.password
    }
  });


export const templates = {
  signUpTemplate,
  pwdResetTemplate,
  emailChangeTemplate,
  usernameChangeTemplate
} as const;

export const sendMail = (recipient: string, template: keyof typeof templates , token: string) => {
  const email = {
    from: 'noreply@npns.biz',
    to: recipient,
    ...templates[template]({ token, frontendAdress: configuration.webAddress })
  }
  return transporter.sendMail(email)
}
