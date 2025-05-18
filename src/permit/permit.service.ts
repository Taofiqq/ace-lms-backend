// src/permit/permit.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Permit } from 'permitio';

@Injectable()
export class PermitService implements OnModuleInit {
  private readonly logger = new Logger(PermitService.name);
  public permit: Permit;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.permit = new Permit({
      token: this.configService.get<string>('PERMIT_API_KEY'),

      pdp:
        this.configService.get<string>('PERMIT_PDP_URL') ||
        'https://cloudpdp.api.permit.io',
    });

    try {
      const tenants = await this.permit.api.tenants.list();
      this.logger.log('Permit.io SDK initialized successfully');
      this.logger.log(
        `Connection test successful - found ${tenants.length} tenant(s)`,
      );
      tenants.forEach((tenant) => {
        this.logger.log(`- Tenant: ${tenant.key} (${tenant.name})`);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Permit.io SDK', error);
    }
  }

  //   // Simple method to check permissions - you'll expand this later
  //   async check(user: string, action: string, resource: string | object) {
  //     try {
  //       return await this.permit.check(user, action, resource);
  //     } catch (error) {
  //       this.logger.error(`Permission check failed: ${error.message}`, error);
  //       // Return false when permission check fails
  //       return false;
  //     }
  //   }
}
