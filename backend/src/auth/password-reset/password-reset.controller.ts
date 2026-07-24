import { Controller, Post, Body } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/password-reset.dto';

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto.token, dto.email, dto.newPassword);
  }
}
