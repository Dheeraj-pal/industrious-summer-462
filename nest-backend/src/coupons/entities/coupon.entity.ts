import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: CouponDiscountType })
  discountType: CouponDiscountType;

  @Column('float', { default: 0 })
  discountValue: number;

  @Column('float', { default: 0 })
  minOrderAmount: number;

  @Column('float', { nullable: true })
  maxDiscount: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column('int', { nullable: true })
  usageLimit: number;

  @Column('int', { nullable: true })
  usageLimitPerUser: number;

  @ManyToMany(() => Product, { nullable: true })
  @JoinTable()
  applicableProducts: Product[];

  @ManyToMany(() => Category, { nullable: true })
  @JoinTable()
  applicableCategories: Category[];

  @Column('simple-array', { nullable: true })
  applicableUserGroups: string[];

  @Column({ default: false })
  firstOrderOnly: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  autoApply: boolean;

  @Column({ default: false })
  isStackable: boolean;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 