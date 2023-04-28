import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserSchema, UserDocument } from '../schemas/user.schema';
import { ImageSchema, ImageDocument } from '../schemas/image.schema';
import mongoose, { Types } from 'mongoose';
import { Readable } from 'stream';

// File to be used in "create()" test
const file: Express.Multer.File = {
  fieldname: 'image',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: __dirname + '/uploads',
  filename: 'test.jpg',
  path: __dirname + '/../../../uploads/test.jpg',
  buffer: Buffer.from('test'),
  stream: new Readable
}

// Create "CreateUserRequest" interface
interface CreateUserRequest {
  name: string;
  password: string;
  email: string;
}

// Model to create an user
//const UserModelCreate = mongoose.model<UserDocument>('User', UserSchema);
const userToCreate: CreateUserRequest = {
  name: 'Davi',
  password: 'Pantera622',
  email: 'davi@gmail.com'
}

// Model to get an user
const UserModelGet = mongoose.model<UserDocument>('User', UserSchema);
const userToGet = new UserModelGet({
  _id: new Types.ObjectId(),
  name: 'Davi',
  password: 'Pantera622',
  email: 'davi@gmail.com',
  imageName: 'Turtle',
  imageFile: file.buffer
})

// Model to get avatar of an user
const AvatarModelGet = mongoose.model<ImageDocument>('Image', ImageSchema);
const avatarToGet = new AvatarModelGet({
  userId: userToGet._id.toString(),
  imageName: 'Turtle',
  base64: file.buffer
})

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: {
          create: jest.fn().mockResolvedValue(userToCreate),
          findOne: jest.fn().mockResolvedValue(userToGet),
          findUserAvatar: jest.fn().mockResolvedValue(avatarToGet),
          remove: jest.fn().mockResolvedValue(avatarToGet)
        }
      }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // create() test
  describe('create', () => {
    it('Should create an user successfully', async () => {
      // Act
      const result = await controller.create(userToCreate, file);
      expect(result).toEqual(userToCreate);
    })
  })

  // findOne() test
  describe('findOne', () => {
    it('Should find a user successfully', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await controller.findOne(userId);

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
      const result = await controller.findUserAvatar(userId);

      // Assert
      expect(result).toEqual(avatarToGet);
    }
    )
  })

  // remove() test
  describe('remove', () => {
    it('Should find a user and delete it', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(result).toEqual(avatarToGet);
    })
  })
});
