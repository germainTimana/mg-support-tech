import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import {
  CreateServicioDto,
  UpdateEstadoDto,
  AddObservacionDto,
} from './dto/servicio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, ServiceStatus } from '../common/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('servicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateServicioDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.serviciosService.create(dto, adminId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  findAll(
    @Query('tecnicoId') tecnicoId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: ServiceStatus,
    @CurrentUser() user?: { id: string; role: UserRole },
  ) {
    if (user?.role === UserRole.TECNICO) {
      return this.serviciosService.findAll({ tecnicoId: user.id, estado });
    }
    if (user?.role === UserRole.CLIENTE) {
      return this.serviciosService.findAll({ clienteId: user.id, estado });
    }
    return this.serviciosService.findAll({ tecnicoId, clienteId, estado });
  }

  @Get('kanban')
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  getKanban(
    @CurrentUser() user: { id: string; role: UserRole },
    @Query('tecnicoId') tecnicoId?: string,
  ) {
    if (user.role === UserRole.TECNICO) {
      return this.serviciosService.getKanban(user.id);
    }
    if (user.role === UserRole.CLIENTE) {
      return this.serviciosService.getKanban(undefined, user.id);
    }
    return this.serviciosService.getKanban(tecnicoId);
  }

  @Get('codigo/:codigo')
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  findByCodigo(
    @Param('codigo') codigo: string,
    @CurrentUser() user?: { id: string; role: UserRole },
  ) {
    return this.serviciosService.findByCodigo(codigo, user?.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  findOne(@Param('id') id: string) {
    return this.serviciosService.findById(id);
  }

  @Patch(':id/estado')
  @Roles(UserRole.ADMIN, UserRole.TECNICO)
  updateEstado(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.serviciosService.updateEstado(id, dto, user);
  }

  @Post(':id/observaciones')
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  addObservacion(
    @Param('id') id: string,
    @Body() dto: AddObservacionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.serviciosService.addObservacion(id, dto, userId);
  }
}

/** Alias pedidos -> servicios */
@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  findAll(
    @Query('tecnicoId') tecnicoId?: string,
    @Query('clienteId') clienteId?: string,
    @CurrentUser() user?: { id: string; role: UserRole },
  ) {
    if (user?.role === UserRole.TECNICO) {
      return this.serviciosService.findAll({ tecnicoId: user.id });
    }
    if (user?.role === UserRole.CLIENTE) {
      return this.serviciosService.findAll({ clienteId: user.id });
    }
    return this.serviciosService.findAll({ tecnicoId, clienteId });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  findOne(@Param('id') id: string) {
    return this.serviciosService.findById(id);
  }
}
