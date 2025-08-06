import { DataSource } from 'typeorm';
import { SuperAdminSeeder } from './super-admin.seeder';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'dollar-general-100625',
    entities: [User, Order, OrderItem, Cart, CartItem, Product, Category],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('Running seeders...');

    // Run seeders
    const superAdminSeeder = new SuperAdminSeeder();
    await superAdminSeeder.run(dataSource);

    console.log('Seeding completed successfully');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed(); 