import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEquipoDto {
  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsString()
  @IsNotEmpty()
  descripcionProblema: string;

  @IsMongoId()
  clienteId: string;

  @IsOptional()
  @IsString()
  accesorios?: string;
}
