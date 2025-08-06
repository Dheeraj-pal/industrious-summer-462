import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';

export enum HomeSectionType {
  BANNER = 'banner',
  PRODUCT_LIST = 'product_list',
  CATEGORY_LIST = 'category_list',
  DEAL_LIST = 'deal_list',
  SPONSORED_LIST = 'sponsored_list',
  GENDER_SHOP = 'gender_shop',
  POPULAR_PRODUCTS = 'popular_products',
  FEATURED_COUPONS = 'featured_coupons',
  GAME_DAY = 'game_day',
}

@Entity('home_sections')
export class HomeSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: HomeSectionType })
  type: HomeSectionType;

  @Column({ default: 0 })
  order: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // For additional flexible data like banner image URLs, etc.

  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: 'home_section_products',
    joinColumn: { name: 'homeSectionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];

  @ManyToMany(() => Category, { nullable: true })
  @JoinTable({
    name: 'home_section_categories',
    joinColumn: { name: 'homeSectionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];
}
