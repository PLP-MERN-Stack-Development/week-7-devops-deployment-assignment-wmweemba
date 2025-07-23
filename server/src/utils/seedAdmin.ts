import User from '../models/User';
import bcrypt from 'bcryptjs';

export const seedAdminUser = async () => {
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('lmsadmin', 10);

  await User.create({
    username: 'admin',
    password: hashedPassword,
  });

  console.log('✅ Admin user seeded: username=admin, password=lmsadmin');
};