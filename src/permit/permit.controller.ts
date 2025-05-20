import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { PermitService } from './permit.service';

@Controller('permit')
export class PermitController {
  constructor(private readonly permitService: PermitService) {}

  @Post('setup-roles')
  @HttpCode(HttpStatus.OK)
  async setupRoles() {
    try {
      const result = await this.permitService.setupRoles();
      return {
        success: true,
        message: 'Roles successfully set up in Permit.io',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to set up roles in Permit.io',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }

  @Post('setup-resources')
  @HttpCode(HttpStatus.OK)
  async setupResources() {
    try {
      const result = await this.permitService.setupResources();
      return {
        success: true,
        message: 'Resources successfully set up in Permit.io',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to set up resources in Permit.io',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
      };
    }
  }
}
