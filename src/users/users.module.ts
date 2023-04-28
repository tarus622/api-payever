import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express/multer';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema } from './schemas/user.schema';
import { ClientsModule, Transport } from '@nestjs/microservices'
import { RabbitService } from '../rabbitmq/rabbitmq.service';
import { MailerModule } from '@nestjs-modules/mailer';
import * as dotenv from  'dotenv' ;

// Load environment variables
const options = {
  path: 'config.env'
}
dotenv.config(options);

@Module({
  imports: [
    // Set up file upload destination and configuration
    MulterModule.register({
      dest: './uploads',
    }),
    // Connect to the User schema in the MongoDB database
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    // Set up connection to RabbitMQ microservice
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'main_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
    // Set up email service using Nodemailer and SMTP transport
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
          ,
        },
      },
      defaults: {
        from: '"Payever API" <no-reply@localhost>',
      },
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, RabbitService],
  exports: [UsersService]
})
export class UsersModule { }
