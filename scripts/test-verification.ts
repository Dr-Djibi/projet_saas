import { User, sequelize } from '../src/lib/models.js';

async function testVerification() {
  try {
    // Clean start
    await sequelize.sync({ force: true });

    const email = 'test@example.com';
    const code = '123456';
    
    // Create user
    const user = await User.create({
      username: 'testuser',
      email: email,
      password: 'password',
      verificationCode: code,
      verificationExpires: new Date(Date.now() + 100000),
      isVerified: false
    });

    console.log('User created, isVerified:', user.isVerified);

    // Verify user
    await user.update({
      isVerified: true,
      verificationCode: null,
      verificationExpires: null
    });

    // Re-fetch user
    const reloadedUser = await User.findOne({ where: { email } });
    console.log('User reloaded, isVerified:', reloadedUser?.isVerified);

    if (reloadedUser?.isVerified === true) {
      console.log('Verification successful!');
    } else {
      console.error('Verification failed!');
    }

  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

testVerification();
