import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async register(data: { email: string; password: string; name: string }) {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    await user.save();

    // Sync user profile to User Service (User_db)
    try {
      await this.createUserProfile({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error('Failed to create user profile in User Service:', error.message);
      // Continue even if profile creation fails - user can still authenticate
    }

    const payload = { email: user.email, sub: user._id, name: user.name, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id, name: user.name, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { success: true, data: payload };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Helper method to create user profile in User Service
  private async createUserProfile(userData: { _id: string; email: string; name: string; role: string }) {
    const userServiceUrl = process.env.USER_SERVICE_HTTP_URL || 'http://localhost:3012';
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${userServiceUrl}/users/sync`, userData)
      );
      return response.data;
    } catch (error) {
      throw new Error(`User profile creation failed: ${error.message}`);
    }
  }
}

