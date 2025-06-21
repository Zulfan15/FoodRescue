import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.foodDonation.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@foodrescue.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      phone: '+62812345678',
      address: 'Malang City Center',
      latitude: -7.9666,
      longitude: 112.6326,
    },
  });

  const donor1 = await prisma.user.create({
    data: {
      email: 'donor1@example.com',
      name: 'Sarah Restaurant',
      password: hashedPassword,
      role: 'DONOR',
      isVerified: true,
      phone: '+62823456789',
      address: 'Jl. Ijen No. 25, Malang',
      latitude: -7.9797,
      longitude: 112.6304,
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      email: 'donor2@example.com',
      name: 'Fresh Market Bakery',
      password: hashedPassword,
      role: 'DONOR',
      isVerified: true,
      phone: '+62834567890',
      address: 'Jl. Veteran No. 15, Malang',
      latitude: -7.9756,
      longitude: 112.6244,
    },
  });

  const recipient1 = await prisma.user.create({
    data: {
      email: 'recipient1@example.com',
      name: 'Ahmad Families',
      password: hashedPassword,
      role: 'RECIPIENT',
      isVerified: true,
      phone: '+62845678901',
      address: 'Jl. Soekarno Hatta No. 50, Malang',
      latitude: -7.9344,
      longitude: 112.6069,
    },
  });

  const recipient2 = await prisma.user.create({
    data: {
      email: 'recipient2@example.com',
      name: 'Community Center Malang',
      password: hashedPassword,
      role: 'RECIPIENT',
      isVerified: true,
      phone: '+62856789012',
      address: 'Jl. Mayjen Panjaitan No. 20, Malang',
      latitude: -7.9518,
      longitude: 112.6130,
    },
  });

  console.log('👥 Created users');

  // Create food donations
  const donation1 = await prisma.foodDonation.create({
    data: {
      title: 'Fresh Bread and Pastries',
      description: 'Daily leftover bread, croissants, and pastries from our bakery. All items are fresh and safe to consume. Perfect for families or community centers.',
      category: 'BAKERY',
      quantity: 20,
      unit: 'pieces',
      expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      address: donor2.address!,
      latitude: donor2.latitude!,
      longitude: donor2.longitude!,
      status: 'AVAILABLE',
      isVerified: true,
      donorId: donor2.id,
    },
  });

  const donation2 = await prisma.foodDonation.create({
    data: {
      title: 'Cooked Rice with Side Dishes',
      description: 'Prepared meals including rice, vegetables, and protein. Cooked fresh today and properly stored. Each portion can feed 1-2 people.',
      category: 'PREPARED_MEALS',
      quantity: 15,
      unit: 'portions',
      expiry: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      address: donor1.address!,
      latitude: donor1.latitude!,
      longitude: donor1.longitude!,
      status: 'AVAILABLE',
      isVerified: true,
      donorId: donor1.id,
    },
  });

  const donation3 = await prisma.foodDonation.create({
    data: {
      title: 'Fresh Vegetables Bundle',
      description: 'Mixed fresh vegetables including carrots, cabbage, spinach, and tomatoes. All vegetables are in good condition and washed.',
      category: 'VEGETABLES',
      quantity: 5,
      unit: 'kg',
      expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      address: donor1.address!,
      latitude: donor1.latitude!,
      longitude: donor1.longitude!,
      status: 'AVAILABLE',
      isVerified: true,
      donorId: donor1.id,
    },
  });

  const donation4 = await prisma.foodDonation.create({
    data: {
      title: 'Assorted Fruits',
      description: 'Fresh fruits including apples, bananas, oranges, and local seasonal fruits. All fruits are ripe and ready to eat.',
      category: 'FRUITS',
      quantity: 3,
      unit: 'kg',
      expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      address: donor2.address!,
      latitude: donor2.latitude!,
      longitude: donor2.longitude!,
      status: 'RESERVED',
      isVerified: true,
      donorId: donor2.id,
    },
  });

  console.log('🍽️ Created food donations');

  // Create reservations
  const reservation1 = await prisma.reservation.create({
    data: {
      quantity: 10,
      message: 'Thank you for the donation! We will pick up tomorrow morning.',
      status: 'CONFIRMED',
      pickupTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      userId: recipient1.id,
      donationId: donation2.id,
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      quantity: 3,
      message: 'Great for our community center. Will pick up this afternoon.',
      status: 'CONFIRMED',
      pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      userId: recipient2.id,
      donationId: donation4.id,
    },
  });

  const reservation3 = await prisma.reservation.create({
    data: {
      quantity: 5,
      message: 'Perfect timing! We need bread for our breakfast program.',
      status: 'PENDING',
      userId: recipient2.id,
      donationId: donation1.id,
    },
  });

  console.log('📝 Created reservations');

  // Create notifications
  await prisma.notification.create({
    data: {
      title: 'New Reservation',
      message: `${recipient1.name} has made a reservation for your donation "${donation2.title}".`,
      type: 'RESERVATION_MADE',
      userId: donor1.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Reservation Confirmed',
      message: `Your reservation for "${donation2.title}" has been confirmed. Please pick it up on time.`,
      type: 'RESERVATION_CONFIRMED',
      userId: recipient1.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Donation Posted Successfully',
      message: `Your donation "${donation1.title}" has been posted and is now visible to recipients.`,
      type: 'DONATION_POSTED',
      userId: donor2.id,
    },
  });

  console.log('🔔 Created notifications');

  // Create some reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Great quality food and very responsive donor. Thank you!',
      userId: recipient1.id,
      reviewedUserId: donor1.id,
      donationId: donation2.id,
      reservationId: reservation1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Fresh vegetables, exactly as described. Will definitely reserve again.',
      userId: recipient2.id,
      reviewedUserId: donor1.id,
      donationId: donation3.id,
    },
  });

  console.log('⭐ Created reviews');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users created: 5 (1 admin, 2 donors, 2 recipients)`);
  console.log(`- Food donations created: 4`);
  console.log(`- Reservations created: 3`);
  console.log(`- Notifications created: 3`);
  console.log(`- Reviews created: 2`);
  console.log('\n🔐 Login credentials:');
  console.log('Admin: admin@foodrescue.com / password123');
  console.log('Donor 1: donor1@example.com / password123');
  console.log('Donor 2: donor2@example.com / password123');
  console.log('Recipient 1: recipient1@example.com / password123');
  console.log('Recipient 2: recipient2@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
