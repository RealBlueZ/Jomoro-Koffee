import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validator kustom: memastikan sebuah string minimal terdiri dari N kata.
 * Penghitungan kata dilakukan TANPA Regex, yaitu dengan memisahkan string
 * berdasarkan spasi lalu membuang elemen kosong (akibat spasi ganda).
 */
@ValidatorConstraint({ name: 'minWords', async: false })
export class MinWordsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const [minWords] = args.constraints as [number];

    // Pisah berdasarkan spasi, buang string kosong (tanpa regex)
    const wordCount = value
      .trim()
      .split(' ')
      .filter((word) => word.length > 0).length;

    return wordCount >= minWords;
  }

  defaultMessage(args: ValidationArguments): string {
    const [minWords] = args.constraints as [number];
    return `${args.property} minimal harus terdiri dari ${minWords} kata`;
  }
}

export function MinWords(
  minWords: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'minWords',
      target: object.constructor,
      propertyName,
      constraints: [minWords],
      options: validationOptions,
      validator: MinWordsConstraint,
    });
  };
}
