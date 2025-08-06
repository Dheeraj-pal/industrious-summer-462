import { BadRequestException } from '@nestjs/common';

/**
 * UUID validation utility
 * Validates UUID v4 format
 */
export class UUIDUtil {
  /**
   * Validates if a string is a valid UUID v4 format
   * @param uuid - The string to validate
   * @returns true if valid UUID, false otherwise
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates UUID and throws BadRequestException if invalid
   * @param uuid - The string to validate
   * @param fieldName - The field name for error message (optional)
   * @throws BadRequestException if UUID is invalid
   */
  static validateUUID(uuid: string, fieldName: string = 'UUID'): void {
    if (!this.isValidUUID(uuid)) {
      throw new BadRequestException(`Invalid ${fieldName} format: ${uuid}`);
    }
  }
} 