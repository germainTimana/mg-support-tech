import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ServiceStatus } from '../../common/enums';

export class CreateServicioDto {
  @IsMongoId()
  equipoId: string;

  @IsMongoId()
  clienteId: string;

  @IsMongoId()
  tecnicoId: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @Min(0)
  costoEstimado: number;
}

export class UpdateEstadoDto {
  @IsEnum(ServiceStatus)
  estado: ServiceStatus;
}

export class AddObservacionDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsEnum(ServiceStatus)
  fase: ServiceStatus;
}
