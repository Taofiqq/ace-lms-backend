import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import * as bcrypt from 'bcrypt';
import { PermitService } from '../permit/permit.service';

interface CreateUserDto {
  email: string;
  password: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private permitService: PermitService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role } = createUserDto;

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await createdUser.save();

    try {
      await this.permitService.syncUser(savedUser);

      let userId: string;
      if (savedUser._id) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        userId = savedUser._id.toString();
      } else {
        throw new Error('User ID is missing after save');
      }

      await this.permitService.assignRoleToUser(userId, role);
    } catch (error) {
      console.error('Failed to sync user with Permit.io:', error);
    }
    return savedUser;
  }
}
