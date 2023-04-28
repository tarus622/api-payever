import * as Joi from 'joi';

export class CreateImageDto {
    readonly imageName: string;
    readonly imageFile: Buffer;

    // Define a schema for the DTO object using the Joi library
    static schema = Joi.object({
      imageName: Joi.string().required(),
      imageFile: Joi.binary().required(),
    })

    constructor(data: any) {
      // Validate the data against the schema defined above
      const {error, value} = CreateImageDto.schema.validate(data, { abortEarly: false });
      
      // If the validation fails, throw an error
      if (error) {
        throw error;
      }

      // If the validation succeeds, set the values of the DTO properties
      this.imageName = value.imageName;
      this.imageFile = value.imageFile;
    }
  }