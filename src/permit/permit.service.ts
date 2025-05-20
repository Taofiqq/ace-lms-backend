// src/permit/permit.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Permit } from 'permitio';
import { User } from 'src/users/schemas/users.schema';

// Define interfaces for our return types
export interface RoleSetupResult {
  rolesCreated: string[];
  success: boolean;
}

// Define role structure
interface RoleDefinition {
  key: string;
  name: string;
  description: string;
  permissions?: string[];
}

export interface ResourceSetupResult {
  resourcesCreated: string[];
  success: boolean;
}

// Define resource structure
export interface ResourceDefinition {
  key: string;
  name: string;
  description: string;
  actions: Record<string, object>;
}

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

  /**
   * Setup the roles for the LMS in Permit.io
   * Creates 5 roles: Admin, Instructor, Learner, Guest, and Content Creator
   */
  async setupRoles(): Promise<RoleSetupResult> {
    try {
      const rolesToCreate: RoleDefinition[] = [
        {
          key: 'admin',
          name: 'Admin',
          description:
            'Full system control, manages users, courses, and settings',
        },
        {
          key: 'instructor',
          name: 'Instructor',
          description:
            'Creates/manages courses, grades assignments, interacts with learners',
        },
        {
          key: 'learner',
          name: 'Learner',
          description: 'Enrolls in courses, completes content, views progress',
        },
        {
          key: 'guest',
          name: 'Guest',
          description: 'Limited access (preview courses, read-only content)',
        },
        {
          key: 'content_creator',
          name: 'Content Creator',
          description:
            'Creates/edits course materials (optional role for dedicated authors)',
        },
      ];

      const createdRoles: string[] = [];

      // Create each role in Permit.io
      for (const role of rolesToCreate) {
        try {
          // Check if role already exists to avoid duplicates
          try {
            const fetchedRoles = await this.permit.api.roles.get(role.key);
            this.logger.log(
              `Role ${role.key} already exists, skipping creation - ${JSON.stringify(fetchedRoles)}`,
            );
            createdRoles.push(role.key);
          } catch (error) {
            // Role doesn't exist, create it
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.response?.status === 404) {
              const createdRole = await this.permit.api.createRole({
                key: role.key,
                name: role.name,
                description: role.description,
                permissions: role.permissions || [],
              });

              this.logger.log(
                `Created role: ${createdRole.key} - ${JSON.stringify(createdRole)}`,
              );
              createdRoles.push(createdRole.key);
            } else {
              // Some other error occurred
              throw error;
            }
          }
        } catch (roleError) {
          this.logger.error(`Failed to create role ${role.key}`, roleError);
          throw roleError;
        }
      }

      return {
        rolesCreated: createdRoles,
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to set up roles', error);
      return {
        rolesCreated: [],
        success: false,
      };
    }
  }

  // Add this method to your PermitService class
  /**
   * Setup the resources for the LMS in Permit.io
   * Creates the core LMS components: User, Course, Enrollment, Content, Assessment, Report, Settings
   */
  async setupResources(): Promise<ResourceSetupResult> {
    try {
      const resourcesToCreate: ResourceDefinition[] = [
        {
          key: 'user',
          name: 'User',
          description: 'User accounts (admins, instructors, learners)',
          actions: {
            create: {},
            read: {},
            update: {},
            delete: {},
            'assign-role': {},
            'view-profile': {},
          },
        },
        {
          key: 'course',
          name: 'Course',
          description:
            'Learning content (modules, videos, quizzes, assignments)',
          actions: {
            create: {},
            read: {},
            update: {},
            delete: {},
            enroll: {},
            'approve-content': {},
          },
        },
        {
          key: 'enrollment',
          name: 'Enrollment',
          description: 'Course registrations and learner progress tracking',
          actions: {
            create: {},
            read: {},
            update: {},
            delete: {},
            'self-enroll': {},
            'enroll-user': {},
            'unenroll-user': {},
          },
        },
        {
          key: 'content',
          name: 'Content',
          description:
            'Files (PDFs, videos, slides), SCORM modules, external links',
          actions: {
            create: {},
            read: {},
            update: {},
            delete: {},
            upload: {},
            download: {},
          },
        },
        {
          key: 'assessment',
          name: 'Assessment',
          description: 'Quizzes, exams, surveys, and grading tools',
          actions: {
            create: {},
            read: {},
            update: {},
            delete: {},
            take: {},
            grade: {},
          },
        },
        {
          key: 'report',
          name: 'Report',
          description:
            'Analytics (completion rates, learner progress, system usage)',
          actions: {
            create: {},
            read: {},
            'generate-system': {},
            'generate-course': {},
            'view-progress': {},
          },
        },
        {
          key: 'settings',
          name: 'Settings',
          description:
            'System configurations (themes, integrations, permissions)',
          actions: {
            read: {},
            update: {},
            'modify-system': {},
            'modify-course': {},
          },
        },
      ];

      const createdResources: string[] = [];

      // Create each resource in Permit.io
      for (const resource of resourcesToCreate) {
        try {
          // Check if resource already exists to avoid duplicates
          try {
            const existingResource = await this.permit.api.resources.get(
              resource.key,
            );
            this.logger.log(
              `Resource ${resource.key} already exists, skipping creation - ${JSON.stringify(existingResource)}`,
            );
            createdResources.push(resource.key);
          } catch (error) {
            // Resource doesn't exist, create it
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.response?.status === 404) {
              const createdResource = await this.permit.api.resources.create({
                key: resource.key,
                name: resource.name,
                description: resource.description,
                actions: resource.actions,
              });

              this.logger.log(`Created resource: ${createdResource.key}`);
              createdResources.push(createdResource.key);
            } else {
              // Some other error occurred
              throw error;
            }
          }
        } catch (resourceError) {
          this.logger.error(
            `Failed to create resource ${resource.key}`,
            resourceError,
          );
          throw resourceError;
        }
      }

      return {
        resourcesCreated: createdResources,
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to set up resources', error);
      return {
        resourcesCreated: [],
        success: false,
      };
    }
  }

  /**
   * Sync a user to Permit.io
   * @param user The user document from MongoDB
   * @returns The result of the sync operation
   */
  async syncUser(user: User): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(`Syncing user ${user.email} to Permit.io`);

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const userId = user._id ? user._id.toString() : '';

      if (!userId) {
        throw new Error('User ID is missing or invalid');
      }

      const syncedUser = await this.permit.api.syncUser({
        key: userId,
        email: user.email,
        // Optional attributes can be added here if needed
        attributes: {},
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(`Successfully synced user ${user.email} to Permit.io`);
      return syncedUser;
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to sync user ${user.email} to Permit.io`,
        error,
      );
      // You can choose to rethrow or handle the error here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to sync user to Permit.io: ${error.message}`);
    }
  }

  /**
   * Assign a role to a user in Permit.io
   * @param userId The MongoDB user ID
   * @param role The role to assign (must match a role defined in Permit.io)
   * @returns The result of the role assignment operation
   */
  async assignRoleToUser(userId: string, role: string): Promise<any> {
    try {
      this.logger.log(`Assigning role '${role}' to user with ID ${userId}`);

      // Assign the role to the user in the default tenant
      const result = await this.permit.api.assignRole({
        user: userId, // The user key (same as used in syncUser)
        role: role, // The role key (e.g., 'admin', 'instructor', 'learner')
        tenant: 'default', // Using the default tenant as specified
      });

      this.logger.log(`Successfully assigned role '${role}' to user ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to assign role '${role}' to user ${userId}`,
        error,
      );

      // Provide more context in the error message
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to assign role '${role}' to user in Permit.io: ${error.message}`,
      );
    }
  }
}
