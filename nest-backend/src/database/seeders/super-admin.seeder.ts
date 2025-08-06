import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';
import { User, Role } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class SuperAdminSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if super admin already exists
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: 'superadmin@dollargeneral.com' }
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
      
      const superAdmin = userRepository.create({
        email: 'superadmin@dollargeneral.com',
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        isActive: true
      });

      await userRepository.save(superAdmin);
      console.log('Super Admin created successfully');
    } else {
      console.log('Super Admin already exists');
    }
  }
}
