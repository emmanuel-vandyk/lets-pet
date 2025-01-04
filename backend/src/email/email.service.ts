import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

    private logger = new Logger(EmailService.name);

    private transporter = nodemailer.createTransport(<nodemailer.TransportOptions>{
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    async sendEmailNodemailer(to: string, subject: string, text: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to,
                subject,
                text,
            });
            this.logger.log('Correo enviado exitosamente');
        } catch (error) {
            this.logger.error('Error enviando correo: ', error);
            throw new Error('Error enviando correo');
        }

    }
}
