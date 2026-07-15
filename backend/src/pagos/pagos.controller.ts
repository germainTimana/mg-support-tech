import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(UserRole.CLIENTE, UserRole.ADMIN)
  create(
    @Body() dto: CreatePagoDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    const clienteId =
      user.role === UserRole.ADMIN ? undefined : user.id;
    return this.pagosService.create(
      dto,
      clienteId || (dto as CreatePagoDto & { clienteId?: string }).clienteId || user.id,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  findAll(@CurrentUser() user: { id: string; role: UserRole }) {
    const clienteId = user.role === UserRole.CLIENTE ? user.id : undefined;
    return this.pagosService.findAll(clienteId);
  }

  @Get('servicio/:servicioId')
  @Roles(UserRole.ADMIN, UserRole.CLIENTE, UserRole.TECNICO)
  findByServicio(@Param('servicioId') servicioId: string) {
    return this.pagosService.findByServicio(servicioId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  findOne(@Param('id') id: string) {
    return this.pagosService.findById(id);
  }
}
