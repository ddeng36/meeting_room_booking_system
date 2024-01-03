import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter} from 'nodemailer';

@Injectable()
export class EmailService {

    transporter: Transporter
    
    constructor(private configService: ConfigService) { 
      console.log(1111111111111111+ this.configService.get<string>('EMAIL_USER')) 
      this.transporter = createTransport({
          host: "smtp.qq.com",
          port: 587,
          secure: false,
          auth: {
              user: this.configService.get<string>('EMAIL_USER'),
              pass: this.configService.get<string>('EMAIL_PASSWORD'),
          },
      });
      }
    
    async sendMail({ to, subject, html }) {
      await this.transporter.sendMail({
        from: {
          name: 'Meeting Room Booking System',
          address: this.configService.get<string>('EMAIL_USER')
        },
        to,
        subject,
        html
      });
    }
}
