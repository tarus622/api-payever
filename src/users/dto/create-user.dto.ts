import * as Joi from 'joi';

export class CreateUserDto {
    readonly name: string;
    readonly password: string;
    readonly email: string;
    readonly imageName: string;
    readonly imageFile: Buffer;

    // Define a schema for the DTO object using the Joi library
    static schema = Joi.object({
      name: Joi.string().required(),
      password: Joi.string().min(7).regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/),
      email: Joi.string().email().required(),
      imageName: Joi.string().required(),
      imageFile: Joi.binary().required(),
    })

    constructor(data: any) {
      // Validate the data against the schema defined above
      const {error, value} = CreateUserDto.schema.validate(data, { abortEarly: false });
      
      // If the validation fails, throw an error
      if (error) {
        throw error;
      }

      // If the validation succeeds, set the values of the DTO properties
      this.name = value.name;
      this.password = value.password;
      this.email = value.email;
      this.imageName = value.imageName;
      this.imageFile = value.imageFile;
    }
  }