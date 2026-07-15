import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipo, EquipoDocument } from './schemas/equipo.schema';
import { CreateEquipoDto } from './dto/equipo.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<EquipoDocument>,
  ) {}

  async create(dto: CreateEquipoDto, adminId: string) {
    const equipo = await this.equipoModel.create({
      ...dto,
      recibidoPorId: adminId,
    });
    return this.populate(equipo._id.toString());
  }

  async findAll() {
    return this.equipoModel
      .find({ activo: true })
      .populate('clienteId', 'nombre email documentoIdentidad telefono')
      .populate('recibidoPorId', 'nombre email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const equipo = await this.populate(id);
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  async findByCliente(clienteId: string) {
    return this.equipoModel
      .find({ clienteId, activo: true })
      .populate('recibidoPorId', 'nombre email')
      .sort({ createdAt: -1 })
      .exec();
  }

  private async populate(id: string) {
    return this.equipoModel
      .findById(id)
      .populate('clienteId', 'nombre email documentoIdentidad telefono')
      .populate('recibidoPorId', 'nombre email')
      .exec();
  }
}
