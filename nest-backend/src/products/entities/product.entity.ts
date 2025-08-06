import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Gender } from '../enums/gender.enum';

export interface ProductImage {
  secure_url: string;
  public_id: string;
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  mrp: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  brand: string;

  @Column('simple-json', { nullable: true })
  images: ProductImage[];

  @Column({ default: true })
  isActive: boolean;

  @Column('float', { default: 0 })
  gstRate: number;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ default: false })
  isDealOfTheWeek: boolean;

  @Column({ default: false })
  isSponsored: boolean;

  @Column({default: false})
  isFeaturedProduct: boolean;

  @Column({default: false})
  isPopularOnSite: boolean;

  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
