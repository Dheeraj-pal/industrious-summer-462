import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UUIDUtil } from '../common/utils/uuid.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    if (typeof createCategoryDto.gstRate === 'number') {
      category.gstRate = createCategoryDto.gstRate;
    }
    return this.categoryRepository.save(category);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const query = this.categoryRepository.createQueryBuilder('category');

    // Pagination
    query.skip((page - 1) * limit).take(limit);

    // Fetch data and count
    const [items, total] = await query.getManyAndCount();

    return {
      items,
      pagination: {
        total: total,
        page: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // return this.categoryRepository.find({
    //   where: { isActive: true },
    //   select: {
    //     id:true,
    //     name: true,
    //     description: true,
    //     image: true,
    //     isActive: true,
    //     gstRate: true,
    //   }
    // });
  }

  async findOne(id: string): Promise<Category> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Category ID');

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Category ID');

    const category = await this.findOne(id);

    if (updateCategoryDto.image && category.image) {
      await this.cloudinaryService.deleteImage(category.image.public_id);
    }

    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    if (typeof updateCategoryDto.gstRate === 'number') {
      category.gstRate = updateCategoryDto.gstRate;
    }
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Category ID');

    const category = await this.findOne(id);
    if (category.image) {
      await this.cloudinaryService.deleteImage(category.image.public_id);
    }
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async count(): Promise<number> {
    return this.categoryRepository.count();
  }
}
