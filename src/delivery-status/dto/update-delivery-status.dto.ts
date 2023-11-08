import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryStatusDto } from './create-delivery-status.dto';

export class UpdateDeliveryStatusDto extends PartialType(
  CreateDeliveryStatusDto,
) {}
