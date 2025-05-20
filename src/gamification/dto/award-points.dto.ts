import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsMongoId,
  IsDate,
  Min,
} from 'class-validator';
import {
  TransactionType,
  PointSource,
} from '../schemas/point-transaction.schema';
import { Type } from 'class-transformer';

export class AwardPointsDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType = TransactionType.EARNED;

  @IsEnum(PointSource)
  @IsNotEmpty()
  source: PointSource;

  @IsMongoId()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expirationDate?: Date;
}
