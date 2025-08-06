import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export interface CategoryImage {
  secure_url: string;
  public_id: string;
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-json', { nullable: true })
  image: CategoryImage;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0, type: 'float' })
  gstRate: number;

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 