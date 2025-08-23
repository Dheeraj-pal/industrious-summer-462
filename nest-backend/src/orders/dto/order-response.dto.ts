import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod, PaymentStatus, DeliveryOption } from '../entities/order.entity';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  productImage: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  gstRate: number;

  @ApiProperty()
  gstAmount: number;
}

export class AddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  addressLine1: string;

  @ApiProperty({ required: false })
  addressLine2?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  pincode: string;

  @ApiProperty()
  country: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  items: OrderItemResponseDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalTax: number;

  @ApiProperty()
  deliveryCharge: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  shippingAddress: AddressResponseDto;

  @ApiProperty({ required: false })
  trackingNumber?: string;

  @ApiProperty({ required: false })
  couponCode?: string;

  @ApiProperty()
  couponDiscount: number;

  @ApiProperty({ required: false })
  couponType?: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ required: false })
  paymentIntentId?: string;

  @ApiProperty({ required: false })
  stripeSessionId?: string;

  @ApiProperty({ enum: DeliveryOption })
  deliveryOption: DeliveryOption;

  @ApiProperty({ required: false })
  estimatedDeliveryDate?: Date;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}