import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Servicio, ServicioDocument } from './schemas/servicio.schema';
import {
  CreateServicioDto,
  UpdateEstadoDto,
  AddObservacionDto,
} from './dto/servicio.dto';
import { ServiceStatus, UserRole } from '../common/enums';
import { EventsGateway } from '../events/events.gateway';
import { AppLogger } from '../common/logger/app-logger.service';
import { NotFoundDomainException, BadRequestDomainException, ForbiddenDomainException } from '../common/exceptions/domain.exception';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectModel(Servicio.name) private servicioModel: Model<ServicioDocument>,
    private eventsGateway: EventsGateway,
    private readonly logger: AppLogger,
  ) {}

  private generateCodigo(): string {
    const short = uuidv4().split('-')[0].toUpperCase();
    return `MGS-${short}`;
  }

  async create(dto: CreateServicioDto, adminId: string) {
    const traceId = this.newTrace();
    try {
      this.logger.info('Creando servicio', {
        context: 'ServiciosService.create',
        traceId,
        adminId,
        clienteId: dto.clienteId,
        tecnicoId: dto.tecnicoId,
      });

      const codigoServicio = this.generateCodigo();
      const servicio = await this.servicioModel.create({
        ...dto,
        codigoServicio,
        creadoPorId: adminId,
        estado: ServiceStatus.PENDIENTE,
        observaciones: [
          {
            fase: ServiceStatus.PENDIENTE,
            texto: 'Servicio registrado y asignado.',
            autorId: adminId,
            fecha: new Date(),
          },
        ],
      });
      const populated = await this.populate(servicio._id.toString());
      this.eventsGateway.emitServicioUpdated(populated);
      this.logger.info('Servicio creado', {
        context: 'ServiciosService.create',
        traceId,
        servicioId: servicio._id.toString(),
        codigoServicio,
      });
      return populated;
    } catch (err) {
      this.logger.error('Fallo al crear servicio', {
        context: 'ServiciosService.create',
        traceId,
        adminId,
        exception: err instanceof Error ? err.stack : String(err),
      });
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestDomainException('No se pudo crear el servicio');
    }
  }

  async findAll(filters?: { tecnicoId?: string; clienteId?: string; estado?: ServiceStatus }) {
    const query: Record<string, unknown> = {};
    if (filters?.tecnicoId) query.tecnicoId = filters.tecnicoId;
    if (filters?.clienteId) query.clienteId = filters.clienteId;
    if (filters?.estado) query.estado = filters.estado;
    return this.servicioModel
      .find(query)
      .populate('equipoId')
      .populate('clienteId', 'nombre email documentoIdentidad telefono')
      .populate('tecnicoId', 'nombre email telefono')
      .populate('creadoPorId', 'nombre email')
      .populate('observaciones.autorId', 'nombre role')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findByCodigo(codigo: string, userId?: string) {
    try {
      const servicio = await this.servicioModel
        .findOne({ codigoServicio: codigo.toUpperCase() })
        .populate('equipoId')
        .populate('clienteId', 'nombre email documentoIdentidad telefono')
        .populate('tecnicoId', 'nombre email telefono')
        .populate('creadoPorId', 'nombre email')
        .populate('observaciones.autorId', 'nombre role')
        .exec();
      if (!servicio) {
        this.logger.warn('Servicio no encontrado por código', {
          context: 'ServiciosService.findByCodigo',
          codigo,
          userId,
        });
        throw new NotFoundDomainException('Servicio no encontrado');
      }
      return servicio;
    } catch (err) {
      if (err instanceof NotFoundDomainException) throw err;
      this.logger.error('Error al buscar servicio por código', {
        context: 'ServiciosService.findByCodigo',
        codigo,
        exception: err instanceof Error ? err.stack : String(err),
      });
      throw err;
    }
  }

  async findById(id: string) {
    const servicio = await this.populate(id);
    if (!servicio) {
      this.logger.warn('Servicio no encontrado por id', {
        context: 'ServiciosService.findById',
        servicioId: id,
      });
      throw new NotFoundDomainException('Servicio no encontrado');
    }
    return servicio;
  }

  async updateEstado(
    id: string,
    dto: UpdateEstadoDto,
    user: { id: string; role: UserRole },
  ) {
    try {
      const servicio = await this.servicioModel.findById(id);
      if (!servicio) throw new NotFoundDomainException('Servicio no encontrado');

      if (user.role === UserRole.TECNICO && servicio.tecnicoId.toString() !== user.id) {
        this.logger.warn('Técnico intenta modificar servicio ajeno', {
          context: 'ServiciosService.updateEstado',
          servicioId: id,
          userId: user.id,
          tecnicoAsignado: servicio.tecnicoId.toString(),
        });
        throw new ForbiddenDomainException('No puede modificar servicios de otro técnico');
      }

      if (user.role === UserRole.CLIENTE) {
        throw new ForbiddenDomainException('El cliente no puede cambiar el estado');
      }

      if (
        servicio.estado === ServiceStatus.ENTREGADO &&
        user.role !== UserRole.ADMIN
      ) {
        this.logger.warn('Intento de revertir servicio entregado sin ser admin', {
          context: 'ServiciosService.updateEstado',
          servicioId: id,
          userId: user.id,
          role: user.role,
          to: dto.estado,
        });
        throw new ForbiddenDomainException(
          'Solo un administrador puede modificar un servicio entregado',
        );
      }

      const validTransitions: Record<ServiceStatus, ServiceStatus[]> = {
        [ServiceStatus.PENDIENTE]: [ServiceStatus.EN_REPARACION],
        [ServiceStatus.EN_REPARACION]: [ServiceStatus.LISTO, ServiceStatus.PENDIENTE],
        [ServiceStatus.LISTO]: [ServiceStatus.ENTREGADO, ServiceStatus.EN_REPARACION],
        [ServiceStatus.ENTREGADO]: [
          ServiceStatus.LISTO,
          ServiceStatus.EN_REPARACION,
          ServiceStatus.PENDIENTE,
        ],
      };

      if (!validTransitions[servicio.estado]?.includes(dto.estado)) {
        this.logger.warn('Transición de estado inválida', {
          context: 'ServiciosService.updateEstado',
          servicioId: id,
          userId: user.id,
          from: servicio.estado,
          to: dto.estado,
        });
        throw new BadRequestDomainException(
          `Transición inválida de ${servicio.estado} a ${dto.estado}`,
        );
      }

      if (dto.estado === ServiceStatus.ENTREGADO && !servicio.pagado) {
        this.logger.warn('Intento de entrega sin pago', {
          context: 'ServiciosService.updateEstado',
          servicioId: id,
          userId: user.id,
        });
        throw new BadRequestDomainException('El servicio debe estar pagado antes de entregarse');
      }

      servicio.estado = dto.estado;
      await servicio.save();
      const populated = await this.populate(id);
      this.eventsGateway.emitServicioUpdated(populated);
      this.logger.info('Estado de servicio actualizado', {
        context: 'ServiciosService.updateEstado',
        servicioId: id,
        userId: user.id,
        estado: dto.estado,
      });
      return populated;
    } catch (err) {
      if (
        err instanceof NotFoundDomainException ||
        err instanceof ForbiddenDomainException ||
        err instanceof BadRequestDomainException
      ) {
        throw err;
      }
      this.logger.error('Error inesperado al actualizar estado', {
        context: 'ServiciosService.updateEstado',
        servicioId: id,
        userId: user.id,
        exception: err instanceof Error ? err.stack : String(err),
      });
      throw new BadRequestDomainException('No se pudo actualizar el estado del servicio');
    }
  }

  async addObservacion(id: string, dto: AddObservacionDto, userId: string) {
    const servicio = await this.servicioModel.findById(id);
    if (!servicio) throw new NotFoundDomainException('Servicio no encontrado');

    servicio.observaciones.push({
      fase: dto.fase,
      texto: dto.texto,
      autorId: userId as unknown as import('mongoose').Types.ObjectId,
      fecha: new Date(),
    });
    await servicio.save();
    const populated = await this.populate(id);
    this.eventsGateway.emitServicioUpdated(populated);
    this.logger.info('Observación agregada', {
      context: 'ServiciosService.addObservacion',
      servicioId: id,
      userId,
    });
    return populated;
  }

  async markAsPaid(id: string) {
    const servicio = await this.servicioModel.findByIdAndUpdate(
      id,
      { pagado: true },
      { new: true },
    );
    if (!servicio) throw new NotFoundDomainException('Servicio no encontrado');
    const populated = await this.populate(id);
    this.eventsGateway.emitServicioUpdated(populated);
    return populated;
  }

  async getKanban(tecnicoId?: string, clienteId?: string) {
    const filter: Record<string, string> = {};
    if (tecnicoId) filter.tecnicoId = tecnicoId;
    if (clienteId) filter.clienteId = clienteId;
    const servicios = await this.findAll(filter);
    const board: Record<ServiceStatus, ServicioDocument[]> = {
      [ServiceStatus.PENDIENTE]: [],
      [ServiceStatus.EN_REPARACION]: [],
      [ServiceStatus.LISTO]: [],
      [ServiceStatus.ENTREGADO]: [],
    };
    for (const s of servicios) {
      board[s.estado as ServiceStatus]?.push(s as ServicioDocument);
    }
    return board;
  }

  private newTrace(): string {
    return `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private async populate(id: string) {
    return this.servicioModel
      .findById(id)
      .populate('equipoId')
      .populate('clienteId', 'nombre email documentoIdentidad telefono')
      .populate('tecnicoId', 'nombre email telefono')
      .populate('creadoPorId', 'nombre email')
      .populate('observaciones.autorId', 'nombre role')
      .exec();
  }
}
