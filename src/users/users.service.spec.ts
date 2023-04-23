import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserDocument, UserSchema } from './schemas/user.schema';
import { RabbitService } from '../rabbitmq/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Readable } from 'stream';
import mongoose, { Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { ClientProxy } from '@nestjs/microservices';

// File to be used in "create()" test
const file: Express.Multer.File = {
  fieldname: 'image',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: '/uploads',
  filename: 'test.jpg',
  path: '/uploads/test.jpg',
  buffer: Buffer.from('test'),
  stream: new Readable
}

// Model to create an user
const UserModelCreate = mongoose.model<UserDocument>('User', UserSchema);
const userToCreate = new UserModelCreate({
  name: 'Davi',
  email: 'davi@gmail.com',
  password: 'pantera',
  imageName: file.filename,
  imageFile: file
})

// Model to get an user
const UserModelGet = mongoose.model<UserDocument>('User', UserSchema);
const userToGet = new UserModelGet({
  _id: new Types.ObjectId(),
  name: 'Davi',
  password: 'pantera',
  email: 'davi@gmail.com',
  imageName: 'turtle',
  imageFile: ''
})

describe('UsersService', () => {
  let service: UsersService;
  let rabbitService: RabbitService;
  let clientRabbit: ClientProxy;
  let clientMailer: ClientProxy;
  let mailerService: MailerService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [{
        provide: UsersService,
        useValue: {
          create: jest.fn().mockResolvedValue(userToCreate),
          findOne: jest.fn().mockResolvedValue(userToGet),
          findUserAvatar: jest.fn().mockResolvedValue(userToGet.imageFile),
          remove: jest.fn().mockResolvedValue(userToGet)
        }
      },
        RabbitService,
      {
        provide: 'RABBITMQ_SERVICE',
        useValue: {
          emit: jest.fn(),
        },
      },
      {
        provide: MailerService,
        useValue: {
          sendMail: jest.fn()
        }
      }]
    }).compile();

    service = module.get<UsersService>(UsersService);
    rabbitService = module.get<RabbitService>(RabbitService);
    clientRabbit = module.get<ClientProxy>('RABBITMQ_SERVICE');
    clientMailer = module.get<ClientProxy>(MailerService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(rabbitService).toBeDefined();
    expect(clientRabbit).toBeDefined();
    expect(clientMailer).toBeDefined();
    expect(mailerService).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // create() test
  describe('create', () => {
    it('Should create an user successfully', async () => {
      // Act
      const createUserDto = new CreateUserDto();
      const result = await service.create(createUserDto, file);

      // Assert
      expect(result).toEqual(userToCreate);
    })
  })

  // findOne() test
  describe('findOne', () => {
    it('Should find a user successfully', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(userToGet);
    })
  })

  // findUserAvatar() test
  describe('findUserAvatar', () => {
    it('Should find a user avatar successfully', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await service.findUserAvatar(userId);

      // Assert
      expect(result).toEqual(userToGet.imageFile);
    }
    )
  })

  // remove() test
  describe('remove', () => {
    it('Should find a user and delete it', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(result).toEqual(userToGet);
    })
  })

  // RabbitMQ publishEvent() test
  describe('publishEvent', () => {
    it('should call clientRabbit.emit with correct arguments', async () => {
      const emitSpy = jest.spyOn(clientRabbit, 'emit');

      await rabbitService.publishEvent();

      expect(emitSpy).toHaveBeenCalledWith('user-created', {
        message: 'User created successfully!',
      });
    });
  })

  // MailerService sendMail() test
  describe('sendMail', () => {
    it('should call clientMail.emit with correct arguments', async () => {
      // Arrange
      const sendMailSpy = jest.spyOn(mailerService, 'sendMail');
      const emailTest = 'emailtest@email.com'

      // Act
      await mailerService.sendMail({
        to: emailTest,
        subject: 'User created!',
        text: 'Congratulations! You successfully register to us site!',
      });

      // Assert
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: emailTest,
        subject: 'User created!',
        text: 'Congratulations! You successfully register to us site!',
      });
    })
  })
})