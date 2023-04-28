import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

const options = {
  path: 'config.env'
}

dotenv.config(options);
@Module({
  imports: [UsersModule, 
    MongooseModule.forRoot(process.env.MONGODB_URI),    
  ]
})
export class AppModule { }
