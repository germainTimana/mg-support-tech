import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/equipo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/** Alias platos -> equipos (recepción de computadores) */
@Controller('platos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlatosController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateEquipoDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.equiposService.create(dto, adminId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TECNICO)
  findAll() {
    return this.equiposService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECNICO, UserRole.CLIENTE)
  findOne(@Param('id') id: string) {
    return this.equiposService.findById(id);
  }
}
