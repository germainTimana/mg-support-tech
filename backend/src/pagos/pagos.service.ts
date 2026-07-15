import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pago, PagoDocument } from './schemas/pago.schema';
import { CreatePagoDto } from './dto/pago.dto';
import { ServiciosService } from '../servicios/servicios.service';
import { ServiceStatus, PaymentStatus } from '../common/enums';

@Injectable()
export class PagosService {
  constructor(
    @InjectModel(Pago.name) private pagoModel: Model<PagoDocument>,
    private serviciosService: ServiciosService,
  ) {}

  async create(dto: CreatePagoDto, clienteId: string) {
    const servicio = await this.serviciosService.findById(dto.servicioId);
    const clienteRef = servicio.clienteId as
      | { _id: { toString(): string } }
      | string
      | null
      | undefined;
    const servicioClienteId =
      typeof clienteRef === 'object' && clienteRef !== null
        ? clienteRef._id.toString()
        : String(clienteRef ?? '');

    if (servicioClienteId !== clienteId) {
      throw new ForbiddenException('Solo el cliente del servicio puede pagar');
    }

    if (servicio.estado !== ServiceStatus.LISTO) {
      throw new BadRequestException(
        'El pago solo está disponible cuando el servicio está en estado Listo',
      );
    }

    if (servicio.pagado) {
      throw new BadRequestException('Este servicio ya fue pagado');
    }

    if (dto.monto < servicio.costoEstimado) {
      throw new BadRequestException(
        `El monto debe ser al menos $${servicio.costoEstimado}`,
      );
    }

    const pago = await this.pagoModel.create({
      ...dto,
      clienteId,
      estado: PaymentStatus.COMPLETADO,
    });

    await this.serviciosService.markAsPaid(dto.servicioId);

    return this.pagoModel
      .findById(pago._id)
      .populate('servicioId')
      .populate('clienteId', 'nombre email')
      .exec();
  }

  async findAll(clienteId?: string) {
    const filter = clienteId ? { clienteId } : {};
    return this.pagoModel
      .find(filter)
      .populate({
        path: 'servicioId',
        populate: { path: 'equipoId' },
      })
      .populate('clienteId', 'nombre email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const pago = await this.pagoModel
      .findById(id)
      .populate('servicioId')
      .populate('clienteId', 'nombre email')
      .exec();
    if (!pago) throw new NotFoundException('Pago no encontrado');
    return pago;
  }

  async findByServicio(servicioId: string) {
    return this.pagoModel
      .findOne({ servicioId })
      .populate('clienteId', 'nombre email')
      .exec();
  }
}
