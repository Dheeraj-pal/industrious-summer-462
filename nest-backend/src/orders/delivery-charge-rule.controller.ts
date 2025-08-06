import { Controller, Post, Patch, Delete, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryChargeRuleService } from './delivery-charge-rule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('delivery-charge-rules')
@Controller('delivery-charge-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeliveryChargeRuleController {
  constructor(private readonly ruleService: DeliveryChargeRuleService) {}

  @Post()
  @Roles('admin')
  create(@Body() data: any) {
    return this.ruleService.create(data);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ruleService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.ruleService.delete(id);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.ruleService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.ruleService.findOne(id);
  }
} 