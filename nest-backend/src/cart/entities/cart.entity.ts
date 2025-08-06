import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.carts)
  user: User;

  @OneToMany(() => CartItem, cartItem => cartItem.cart, {
    cascade: true,
  })
  items: CartItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalTax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSavings: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalMRP: number;

  @Column({ nullable: true })
  couponCode: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  couponDiscount: number;

  @Column({ nullable: true })
  appliedCouponId: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 