import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  try {
    // Check if admin already exists
    const existingAdmin = await userModel.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in Auth_db');
      console.log('   Email: admin@example.com');
      console.log('   Role:', existingAdmin.role);
      console.log('   ID:', existingAdmin._id);
      
      // Also sync to User Service
      console.log('');
      console.log('🔄 Syncing admin profile to User Service...');
      await syncAdminToUserService(existingAdmin._id.toString(), existingAdmin.email, existingAdmin.name, existingAdmin.role);
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new userModel({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      });

      await admin.save();
      
      console.log('✅ Admin user created successfully in Auth_db!');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   ID:', admin._id);
      
      // Sync to User Service
      console.log('');
      console.log('🔄 Syncing admin profile to User Service...');
      await syncAdminToUserService(admin._id.toString(), admin.email, admin.name, admin.role);
      
      console.log('');
      console.log('⚠️  Please change the password after first login in production!');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await app.close();
  }
}

async function syncAdminToUserService(id: string, email: string, name: string, role: string) {
  const userServiceUrl = process.env.USER_SERVICE_HTTP_URL || 'http://localhost:3012';
  
  try {
    const response = await axios.post(`${userServiceUrl}/users/sync`, {
      _id: id,
      email: email,
      name: name,
      role: role,
    });
    
    console.log('✅ Admin profile synced to User_db successfully!');
    console.log('   User Service Response:', response.data.message);
  } catch (error) {
    console.error('❌ Failed to sync admin to User Service:', error.message);
    console.error('   Make sure User Service is running on port 3012');
    console.error('   You can manually sync later by registering again or calling the sync endpoint');
  }
}

bootstrap();
