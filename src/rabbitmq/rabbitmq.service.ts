import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitService {

  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy){}

  async publishEvent() {
    this.client.emit('user-created', {message: 'User created successfully!'});
  }
}