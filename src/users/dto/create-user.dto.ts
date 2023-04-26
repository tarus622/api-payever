import * as Joi from 'joi';

export class CreateUserDto {
    readonly name: string;
    readonly password: string;
    readonly email: string;
    readonly imageName: string;
    readonly imageFile: Buffer;

    static schema = Joi.object({
      name: Joi.string().required(),
      password: Joi.string().min(7).regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/),
      email: Joi.string().email().required(),
      imageName: Joi.string().required(),
      imageFile: Joi.binary().required(),
    })

    constructor(data: any) {
      const {error, value} = CreateUserDto.schema.validate(data, { abortEarly: false });
      if (error) {
        throw error;
      }
      this.name = value.name;
      this.password = value.password;
      this.email = value.email;
      this.imageName = value.imageName;
      this.imageFile = value.imageFile;
    }
  }