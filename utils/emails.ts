import fs from 'fs';
import path from "path";
import '@src/config/globals.js';
import sendMail from './nodemailer.js';
import { consoleLog } from './helpers.ts';

const EMAIL_TEMPLATES_PATH = path.join(global.TEMPLATES_PATH, "email");

export const TEMPLATES = {
    verify: {
        subject: "Verificación de correo electrónico de DINEX",
        file: 'verify_email.html'
    },
    otp: {
        subject: "Código de verificación:",
        file: 'otp.html'
    }
}

export async function email_OTP(email,otp) {
    try{
        const templatePath = path.join(EMAIL_TEMPLATES_PATH, `${TEMPLATES.otp.file}`);
        let template = fs.readFileSync(templatePath, 'utf8');
        consoleLog("template");
        const variables = {
            otp: otp,
            email: email
        };
        // Reemplaza las variables en la plantilla
        Object.keys(variables).forEach(key => {
            // consoleLog("key", key);
            const regex = new RegExp(`{${key}}`, 'g');
            template = template.replace(regex, variables[key]);
        });
    
        let subject = `${TEMPLATES.otp.subject} ${otp}`;
        let info = await sendMail(email,subject,template);
        return {success: true, message: info};
    }catch(error){
        console.error('Error al enviar el correo. ',error);
        return {success: false, error: error}
    }
}

export async function email_verify(email,name,token) {
    try{
        const templateData = TEMPLATES.verify;
        const templatePath = path.join(EMAIL_TEMPLATES_PATH, `${templateData.file}`);
        let template = fs.readFileSync(templatePath, 'utf8');
        const url = `${process.env.FRONTEND_URL}/verifiy-email?token=${token}`;
        const variables = {
            name: name,
            url: url
        };
        // Replace variables in the template
        Object.keys(variables).forEach(key => {
            // consoleLog("key", key);
            const regex = new RegExp(`{${key}}`, 'g');
            template = template.replace(regex, variables[key]);
        });
    
        let subject = `${templateData.subject}`;
        let info = await sendMail(email,subject,template);
        return {success: true, message: info};
    }catch(error){
        console.error('Error al enviar el correo. ',error);
        return {success: false, error: error}
    }
}