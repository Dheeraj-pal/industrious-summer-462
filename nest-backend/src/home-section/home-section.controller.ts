import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HomeSectionType } from './entities/home-section.entity';
import { HomeSectionService } from './home-section.service';
import { CreateHomeSectionDto } from './dto/create-home-section.dto';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { HomeSection } from './entities/home-section.entity';
import { HomeScreenResponseDto } from './dto/home-screen-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  CloudinaryService,
  CloudinaryUploadResult,
} from '../cloudinary/cloudinary.service';

@ApiTags('home-sections')
@Controller('home-sections')
@ApiBearerAuth()
export class HomeSectionController {
  constructor(
    private readonly homeSectionService: HomeSectionService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new home section (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The home section has been successfully created.',
    type: HomeSection,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the home section' },
        type: {
          type: 'string',
          description: 'Type of the home section',
          enum: Object.values(HomeSectionType),
        },
        order: { type: 'number', description: 'Display order of the section' },
        metadata: {
          type: 'string',
          description: 'Additional metadata as JSON string. For GENDER_SHOP type, include: {"genderOptions":[{"imageIndex":0,"label":"Shop for Him"}]}',
        },
        productIds: {
          type: 'string',
          description: 'Comma-separated list of product IDs',
        },
        categoryIds: {
          type: 'string',
          description: 'Comma-separated list of category IDs',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Images for the section (max 5 files). For GENDER_SHOP, these images will be referenced by imageIndex in genderOptions.',
        },
        imageProductMappings: {
          type: 'string',
          description:
            'JSON string mapping images to products: [{imageIndex: 0, productIds: ["id1", "id2"]}]',
        },
        imageCategoryMappings: {
          type: 'string',
          description:
            'JSON string mapping images to categories: [{imageIndex: 0, categoryIds: ["id1", "id2"]}]',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createHomeSectionDto: CreateHomeSectionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Process the uploaded files
    let uploadedImages: CloudinaryUploadResult[] = [];
    if (files && files.length > 0) {
      uploadedImages = await this.cloudinaryService.uploadMultipleImages(
        files,
        'home-sections',
      );
    }

    // Parse string arrays if they come as strings
    let productIds = createHomeSectionDto.productIds;
    let categoryIds = createHomeSectionDto.categoryIds;
    if (typeof productIds === 'string') {
      productIds = (productIds as string)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id);
    }
    if (typeof categoryIds === 'string') {
      categoryIds = (categoryIds as string)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id);
    }

    // Parse metadata if it comes as a string
    let metadata = createHomeSectionDto.metadata || {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = {};
      }
    }

    // Add uploaded images to metadata
    if (uploadedImages.length > 0) {
      metadata.images = uploadedImages.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      }));
      
      // Process genderOptions if this is a gender_shop section
      if (createHomeSectionDto.type === HomeSectionType.GENDER_SHOP && metadata.genderOptions) {
        if (Array.isArray(metadata.genderOptions)) {
          // Replace imageIndex references with actual image URLs
          metadata.genderOptions = metadata.genderOptions.map(option => {
            if (typeof option.imageIndex === 'number' && option.imageIndex >= 0 && option.imageIndex < uploadedImages.length) {
              // Replace imageIndex with actual image URL
              return {
                ...option,
                image: uploadedImages[option.imageIndex].secure_url,
                imageIndex: undefined // Remove the imageIndex property
              };
            }
            return option;
          });
        }
      }
    }

    // Process image mappings if provided
    if (createHomeSectionDto.imageProductMappings) {
      try {
        const mappings = JSON.parse(createHomeSectionDto.imageProductMappings);
        metadata.imageProductMappings = mappings;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    if (createHomeSectionDto.imageCategoryMappings) {
      try {
        const mappings = JSON.parse(createHomeSectionDto.imageCategoryMappings);
        metadata.imageCategoryMappings = mappings;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    return this.homeSectionService.create({
      ...createHomeSectionDto,
      productIds,
      categoryIds,
      metadata,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all home sections' })
  @ApiResponse({
    status: 200,
    description: 'Returns all home sections.',
    type: [HomeSection],
  })
  findAll() {
    return this.homeSectionService.findAll();
  }

  @Get('home-screen')
  @ApiOperation({
    summary: 'Get all home sections for the home screen with associated data',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns all home sections with their associated products and categories.',
    type: HomeScreenResponseDto,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of sections to return',
    type: Number,
  })
  getHomeScreenSections(@Query('limit') limit?: number) {
    return this.homeSectionService.getHomeScreenSections(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a home section by ID' })
  @ApiParam({ name: 'id', description: 'ID of the home section', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns the home section with the specified ID.',
    type: HomeSection,
  })
  findOne(@Param('id') id: string) {
    return this.homeSectionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a home section by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the home section', type: String })
  @ApiResponse({
    status: 200,
    description: 'The home section has been successfully updated.',
    type: HomeSection,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the home section' },
        type: {
          type: 'string',
          description: 'Type of the home section',
          enum: Object.values(HomeSectionType),
        },
        order: { type: 'number', description: 'Display order of the section' },
        metadata: {
          type: 'string',
          description: 'Additional metadata as JSON string. For GENDER_SHOP type, include: {"genderOptions":[{"imageIndex":0,"label":"Shop for Him"}]}',
        },
        productIds: {
          type: 'string',
          description: 'Comma-separated list of product IDs',
        },
        categoryIds: {
          type: 'string',
          description: 'Comma-separated list of category IDs',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Images for the section (max 5 files). For GENDER_SHOP, these images will be referenced by imageIndex in genderOptions.',
        },
        imageProductMappings: {
          type: 'string',
          description:
            'JSON string mapping images to products: [{imageIndex: 0, productIds: ["id1", "id2"]}]',
        },
        imageCategoryMappings: {
          type: 'string',
          description:
            'JSON string mapping images to categories: [{imageIndex: 0, categoryIds: ["id1", "id2"]}]',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id') id: string,
    @Body() updateHomeSectionDto: UpdateHomeSectionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Get the existing home section to access its metadata
    const existingSection = await this.homeSectionService.findOne(id);

    // Process the uploaded files
    let uploadedImages: CloudinaryUploadResult[] = [];
    if (files && files.length > 0) {
      uploadedImages = await this.cloudinaryService.uploadMultipleImages(
        files,
        'home-sections',
      );
    }

    // Parse string arrays if they come as strings
    let productIds = updateHomeSectionDto.productIds;
    let categoryIds = updateHomeSectionDto.categoryIds;

    if (typeof productIds === 'string') {
      productIds = (productIds as string)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id);
    }

    if (typeof categoryIds === 'string') {
      categoryIds = (categoryIds as string)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id);
    }

    // Parse metadata if it comes as a string
    let metadata =
      updateHomeSectionDto.metadata || existingSection.metadata || {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = existingSection.metadata || {};
      }
    }

    // Add uploaded images to metadata
    if (uploadedImages.length > 0) {
      // Preserve existing images if any
      const existingImages = metadata.images || [];
      metadata.images = [
        ...existingImages,
        ...uploadedImages.map((img) => ({
          url: img.secure_url,
          public_id: img.public_id,
        })),
      ];
      
      // Process genderOptions if this is a gender_shop section
      if (updateHomeSectionDto.type === HomeSectionType.GENDER_SHOP || 
          (existingSection.type === HomeSectionType.GENDER_SHOP && !updateHomeSectionDto.type)) {
        if (metadata.genderOptions && Array.isArray(metadata.genderOptions)) {
          // Get the starting index for new images
          const startIndex = existingImages.length;
          
          // Replace imageIndex references with actual image URLs
          metadata.genderOptions = metadata.genderOptions.map(option => {
            if (typeof option.imageIndex === 'number') {
              // If imageIndex refers to a new image
              if (option.imageIndex >= 0 && option.imageIndex < uploadedImages.length) {
                // Replace imageIndex with actual image URL from newly uploaded images
                return {
                  ...option,
                  image: uploadedImages[option.imageIndex].secure_url,
                  imageIndex: undefined // Remove the imageIndex property
                };
              } else if (option.imageIndex >= 0 && option.imageIndex < existingImages.length) {
                // Reference to an existing image
                return {
                  ...option,
                  image: existingImages[option.imageIndex].url,
                  imageIndex: undefined // Remove the imageIndex property
                };
              }
            }
            return option;
          });
        }
      }
    }

    // Process image mappings if provided
    if (updateHomeSectionDto.imageProductMappings) {
      try {
        const mappings = JSON.parse(updateHomeSectionDto.imageProductMappings);
        metadata.imageProductMappings = mappings;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    if (updateHomeSectionDto.imageCategoryMappings) {
      try {
        const mappings = JSON.parse(updateHomeSectionDto.imageCategoryMappings);
        metadata.imageCategoryMappings = mappings;
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    return this.homeSectionService.update(id, {
      ...updateHomeSectionDto,
      productIds,
      categoryIds,
      metadata,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a home section by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the home section', type: String })
  @ApiResponse({
    status: 200,
    description: 'The home section has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.homeSectionService.remove(id);
  }
}
