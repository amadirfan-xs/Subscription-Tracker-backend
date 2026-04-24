import { IsString, MinLength, Matches, Validate } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least 8 characters, one uppercase letter, and a special symbol.',
  })
  newPassword: string;

  @IsString()
  confirmPassword: string;
}
