import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { Product } from '../entities/product.entity';

class Banner {
  @ApiProperty()
  id: number;

  @ApiProperty()
  image: string;
}

class ShopForGender {
  @ApiProperty()
  male: Product[];

  @ApiProperty()
  female: Product[];

  @ApiProperty()
  kids: Product[];
}

export class HomeScreenDto {
  @ApiProperty({ type: [Banner] })
  bannerImages: Banner[];

  @ApiProperty({ type: [Category] })
  shopByCategory: Category[];

  @ApiProperty({ type: ShopForGender })
  refreshYourHomeAndBeautyStorage: ShopForGender;

  @ApiProperty({ type: [Product] })
  popularOnOurSite: Product[];

  @ApiProperty({ type: [Coupon] })
  featuredCoupons: Coupon[];

  @ApiProperty({ type: [Banner] })
  gameDay: Banner[];

  @ApiProperty({ type: [Product] })
  dealsOfTheWeek: Product[];

  @ApiProperty({ type: [Product] })
  sponsoredProducts: Product[];
}
