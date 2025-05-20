import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class AwardBadgeDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  badgeId: string;

  @IsString()
  @IsOptional()
  awardReason?: string;

  @IsBoolean()
  @IsOptional()
  isDisplayed?: boolean;
}
