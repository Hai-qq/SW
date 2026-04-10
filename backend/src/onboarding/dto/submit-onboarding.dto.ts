import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OnboardingAnswerDto {
  @IsInt()
  questionId!: number;

  @IsOptional()
  @IsString()
  selected?: string;
}

export class SubmitOnboardingDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OnboardingAnswerDto)
  answers!: OnboardingAnswerDto[];
}
