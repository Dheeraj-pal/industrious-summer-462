import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryChargeRule, DeliveryLocationType } from './entities/delivery-charge-rule.entity';

@Injectable()
export class DeliveryChargeRuleService {
  constructor(
    @InjectRepository(DeliveryChargeRule)
    private readonly ruleRepository: Repository<DeliveryChargeRule>,
  ) {}

  async create(data: any) {
    const rule = this.ruleRepository.create(data);
    return this.ruleRepository.save(rule);
  }

  async update(id: string, data: any) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found');
    Object.assign(rule, data);
    return this.ruleRepository.save(rule);
  }

  async delete(id: string) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found');
    await this.ruleRepository.remove(rule);
    return { message: 'Rule deleted' };
  }

  async findAll() {
    return this.ruleRepository.find();
  }

  async findOne(id: string) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found');
    return rule;
  }

  // Find the best rule for a given address and order amount
  async getApplicableRule(address: any, orderAmount: number): Promise<DeliveryChargeRule | null> {
    // Prioritize: pincode > city > state > country > global
    const rules = await this.ruleRepository.find({ where: { isActive: true } });
    let bestRule: DeliveryChargeRule | null = null;
    for (const type of [DeliveryLocationType.PINCODE, DeliveryLocationType.CITY, DeliveryLocationType.STATE, DeliveryLocationType.COUNTRY, DeliveryLocationType.GLOBAL]) {
      const match = rules.find(r => r.locationType === type && (!r.locationValue || r.locationValue === address[type.toLowerCase()]));
      if (match) {
        bestRule = match;
        break;
      }
    }
    if (bestRule && bestRule.minOrderAmountForFree && orderAmount >= bestRule.minOrderAmountForFree) {
      return { ...bestRule, charge: 0 };
    }
    return bestRule;
  }
} 