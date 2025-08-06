import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeSection, HomeSectionType } from './entities/home-section.entity';
import { CreateHomeSectionDto } from './dto/create-home-section.dto';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class HomeSectionService {
  constructor(
    @InjectRepository(HomeSection)
    private homeSectionRepository: Repository<HomeSection>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createHomeSectionDto: CreateHomeSectionDto): Promise<HomeSection> {
    const { productIds, categoryIds, ...sectionData } = createHomeSectionDto;

    // Validate section type and required data
    this.validateSectionTypeAndData(createHomeSectionDto);

    const homeSection = this.homeSectionRepository.create(sectionData);

    if (productIds && productIds.length > 0) {
      const products = await this.productRepository.findByIds(productIds);
      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more product IDs are invalid.');
      }
      homeSection.products = products;
    }

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findByIds(categoryIds);
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('One or more category IDs are invalid.');
      }
      homeSection.categories = categories;
    }

    return this.homeSectionRepository.save(homeSection);
  }

  async findAll(): Promise<HomeSection[]> {
    return this.homeSectionRepository.find({
      relations: ['products', 'categories'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<HomeSection> {
    const homeSection = await this.homeSectionRepository.findOne({
      where: { id },
      relations: ['products', 'categories'],
    });
    if (!homeSection) {
      throw new NotFoundException(`Home section with ID "${id}" not found.`);
    }
    return homeSection;
  }

  async update(id: string, updateHomeSectionDto: UpdateHomeSectionDto): Promise<HomeSection> {
    const homeSection = await this.findOne(id);
    const { productIds, categoryIds, ...sectionData } = updateHomeSectionDto;

    // Validate section type and required data if type is being updated
    // or if product/category IDs or metadata are being updated
    this.validateSectionTypeAndData({
      ...updateHomeSectionDto,
      type: updateHomeSectionDto.type || homeSection.type
    });

    Object.assign(homeSection, sectionData);

    if (productIds !== undefined) {
      if (productIds && productIds.length > 0) {
        const products = await this.productRepository.findByIds(productIds);
        if (products.length !== productIds.length) {
          throw new BadRequestException('One or more product IDs are invalid.');
        }
        homeSection.products = products;
      } else {
        homeSection.products = []; // Clear products if an empty array is provided
      }
    }

    if (categoryIds !== undefined) {
      if (categoryIds && categoryIds.length > 0) {
        const categories = await this.categoryRepository.findByIds(categoryIds);
        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('One or more category IDs are invalid.');
        }
        homeSection.categories = categories;
      } else {
        homeSection.categories = []; // Clear categories if an empty array is provided
      }
    }

    return this.homeSectionRepository.save(homeSection);
  }

  async remove(id: string): Promise<void> {
    const result = await this.homeSectionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Home section with ID "${id}" not found.`);
    }
  }

  /**
   * Validates that the section type has the required data
   */
  private validateSectionTypeAndData(dto: CreateHomeSectionDto | UpdateHomeSectionDto): void {
    const { type, productIds, categoryIds, metadata } = dto;
    
    // Skip validation for partial updates where type is not provided
    if (!type) return;
    
    switch (type) {
      case HomeSectionType.BANNER:
      case HomeSectionType.GAME_DAY:
        // Banner sections should have image URLs in metadata
        if (!metadata || !metadata.images || !Array.isArray(metadata.images) || metadata.images.length === 0) {
          throw new BadRequestException(`${type} section requires 'images' array in metadata`);
        }
        
        // If image mappings are provided, validate them
        if (metadata.imageProductMappings) {
          if (!Array.isArray(metadata.imageProductMappings)) {
            throw new BadRequestException(`imageProductMappings must be an array`);
          }
          
          // Validate each mapping has imageIndex and productIds
          for (const mapping of metadata.imageProductMappings) {
            if (typeof mapping.imageIndex !== 'number' || !Array.isArray(mapping.productIds)) {
              throw new BadRequestException(`Each image-product mapping must have imageIndex and productIds array`);
            }
            
            // Check if the imageIndex is valid
            if (mapping.imageIndex < 0 || mapping.imageIndex >= metadata.images.length) {
              throw new BadRequestException(`Invalid imageIndex in image-product mapping: ${mapping.imageIndex}`);
            }
          }
        }
        
        if (metadata.imageCategoryMappings) {
          if (!Array.isArray(metadata.imageCategoryMappings)) {
            throw new BadRequestException(`imageCategoryMappings must be an array`);
          }
          
          // Validate each mapping has imageIndex and categoryIds
          for (const mapping of metadata.imageCategoryMappings) {
            if (typeof mapping.imageIndex !== 'number' || !Array.isArray(mapping.categoryIds)) {
              throw new BadRequestException(`Each image-category mapping must have imageIndex and categoryIds array`);
            }
            
            // Check if the imageIndex is valid
            if (mapping.imageIndex < 0 || mapping.imageIndex >= metadata.images.length) {
              throw new BadRequestException(`Invalid imageIndex in image-category mapping: ${mapping.imageIndex}`);
            }
          }
        }
        break;
        
      case HomeSectionType.PRODUCT_LIST:
      case HomeSectionType.DEAL_LIST:
      case HomeSectionType.SPONSORED_LIST:
      case HomeSectionType.POPULAR_PRODUCTS:
        // Product-based sections should have product IDs
        if (!productIds || !productIds.length) {
          throw new BadRequestException(`${type} section requires product IDs`);
        }
        break;
        
      case HomeSectionType.CATEGORY_LIST:
        // Category-based sections should have category IDs
        if (!categoryIds || !categoryIds.length) {
          throw new BadRequestException(`${type} section requires category IDs`);
        }
        break;
        
      case HomeSectionType.GENDER_SHOP:
        // Gender shop should have image URLs and labels in metadata
        if (!metadata || !metadata.genderOptions || !Array.isArray(metadata.genderOptions) || metadata.genderOptions.length === 0) {
          throw new BadRequestException(`${type} section requires 'genderOptions' array in metadata with image and label properties`);
        }
        break;
        
      case HomeSectionType.FEATURED_COUPONS:
        // Featured coupons can have product IDs or coupon data in metadata
        if ((!productIds || !productIds.length) && (!metadata || !metadata.coupons)) {
          throw new BadRequestException(`${type} section requires either product IDs or coupon data in metadata`);
        }
        break;
    }
  }

  async getHomeScreenSections(limit?: number): Promise<{ sections: any[], availableSectionTypes: string[] }> {
    // Get all home sections ordered by their display order
    const query = this.homeSectionRepository
      .createQueryBuilder('homeSection')
      .leftJoinAndSelect('homeSection.products', 'products')
      .leftJoinAndSelect('homeSection.categories', 'categories')
      .orderBy('homeSection.order', 'ASC');

    // Apply limit if provided
    if (limit && !isNaN(limit) && limit > 0) {
      query.take(limit);
    }

    const homeSections = await query.getMany();

    // Transform the data to include only necessary information for the frontend
    const sections = homeSections.map(section => {
      const result: any = {
        id: section.id,
        title: section.title,
        type: section.type,
        order: section.order,
        metadata: section.metadata || {},
      };

      // Add products data if this section has products
      if (section.products && section.products.length > 0) {
        result.products = section.products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          brand: product.brand,
          stock: product.stock,
          isDealOfTheWeek: product.isDealOfTheWeek,
          isSponsored: product.isSponsored,
          images: product.images?.map(img => img.secure_url) || [],
          // Add any other product fields needed for the frontend
        }));
      }

      // Add categories data if this section has categories
      if (section.categories && section.categories.length > 0) {
        result.categories = section.categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image?.secure_url,
          // Add any other category fields needed for the frontend
        }));
      }
      
      // Transform image data for the frontend
      if (result.metadata && result.metadata.images) {
        // Convert the complex image objects to simple URLs for the frontend
        result.metadata.images = result.metadata.images.map((img, index) => {
          // If it's already a string URL, return it as is
          if (typeof img === 'string') return img;
          
          // If it's an object with url property, extract the URL
          const imageUrl = img.url || img.secure_url || img;
          
          // Find product mappings for this image
          const productMapping = result.metadata.imageProductMappings?.find(m => m.imageIndex === index);
          const categoryMapping = result.metadata.imageCategoryMappings?.find(m => m.imageIndex === index);
          
          // Return a structured object with the image URL and any mappings
          return {
            url: imageUrl,
            productIds: productMapping?.productIds || [],
            categoryIds: categoryMapping?.categoryIds || []
          };
        });
      }

      return result;
    });
    
    // Get all available section types from the enum
    const availableSectionTypes = Object.values(HomeSectionType);
    
    return { sections, availableSectionTypes };
  }
}
