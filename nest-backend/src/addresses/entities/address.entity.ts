import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Country, State, City } from '../enums/location.enum';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  pincode: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ type: 'enum', enum: City })
  city: City;

  @Column({ type: 'enum', enum: State })
  state: State;

  @Column({ type: 'enum', enum: Country })
  country: Country;

  @Column({ nullable: true })
  landmark: string;

  @Column({ default: 'Home' })
  type: string; // Home, Work, Other

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 