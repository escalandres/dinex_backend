import fs from 'fs';
import path from "path";
import sendMail from './nodemailer.js';
import { consoleLog } from './helpers.ts';

export const PLANTILLAS = {
    recover: {
        subject: "Recuperar cuenta",
        file: 'p.html'
    },
    notify: {
        subject: "Hay novedades en tu cuenta",
        file: 'notify.html'
    },
    encendido: {
        subject: "Rastreador encendido",
        file: 'encendido.html'
    },
    otp: {
        subject: "Código de verificación:",
        file: 'otp.html'
    }
}

export async function email_OTP(email,otp) {
    try{
        const templateFolder = EMAIL_TEMPLATES_PATH;
        const templatePath = path.join(templateFolder, `${PLANTILLAS.otp.file}`);
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
    
        let subject = `${PLANTILLAS.otp.subject} ${otp}`;
        let info = await sendMail(email,subject,template);
        return {success: true, message: info};
    }catch(error){
        console.error('Error al enviar el correo. ',error);
        return {success: false, error: error}
    }
}