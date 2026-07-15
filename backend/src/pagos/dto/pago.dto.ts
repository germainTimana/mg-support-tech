import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../common/enums';

export class CreatePagoDto {
  @IsMongoId()
  servicioId: string;

  @IsEnum(PaymentMethod)
  metodo: PaymentMethod;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsString()
  @IsNotEmpty()
  referencia: string;

  @IsOptional()
  @IsString()
  telefonoOrigen?: string;

  @IsOptional()
  @IsString()
  nombreTitular?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
