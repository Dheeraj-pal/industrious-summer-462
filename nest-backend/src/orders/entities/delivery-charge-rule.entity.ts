import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DeliveryLocationType {
  PINCODE = 'pincode',
  CITY = 'city',
  STATE = 'state',
  COUNTRY = 'country',
  GLOBAL = 'global',
}

@Entity('delivery_charge_rules')
export class DeliveryChargeRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DeliveryLocationType, default: DeliveryLocationType.GLOBAL })
  locationType: DeliveryLocationType;

  @Column({ nullable: true })
  locationValue: string;

  @Column('decimal', { precision: 10, scale: 2 })
  charge: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderAmountForFree: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 