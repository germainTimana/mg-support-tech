import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ServiciosService } from './servicios.service';
import { ServiceStatus, UserRole } from '../common/enums';
import { EventsGateway } from '../events/events.gateway';
import { AppLogger } from '../common/logger/app-logger.service';
import {
  NotFoundDomainException,
  BadRequestDomainException,
  ForbiddenDomainException,
} from '../common/exceptions/domain.exception';

function buildDoc(overrides: Record<string, unknown> = {}) {
  const estado = (overrides.estado as ServiceStatus) ?? ServiceStatus.PENDIENTE;
  const doc: any = {
    _id: new Types.ObjectId(),
    codigoServicio: 'MGS-TEST',
    equipoId: new Types.ObjectId(),
    clienteId: new Types.ObjectId(),
    tecnicoId: new Types.ObjectId(),
    creadoPorId: new Types.ObjectId(),
    estado,
    descripcion: 'Equipo roto',
    costoEstimado: 100,
    pagado: false,
    observaciones: [],
    save: jest.fn(async function () {
      return this;
    }),
    ...overrides,
  };
  return doc;
}

describe('ServiciosService', () => {
  let service: ServiciosService;
  let model: any;
  let events: any;
  let logger: any;

  const admin = { id: new Types.ObjectId().toString(), role: UserRole.ADMIN };
  const tecnico = { id: new Types.ObjectId().toString(), role: UserRole.TECNICO };
  const cliente = { id: new Types.ObjectId().toString(), role: UserRole.CLIENTE };

  function queryChain(doc: any) {
    const exec = jest.fn(async () => doc);
    const chain: any = {
      populate: jest.fn(() => chain),
      sort: jest.fn(() => chain),
      exec,
      then: (resolve: any, reject: any) => exec().then(resolve, reject),
    };
    return chain;
  }

  function mockFindById(doc: any) {
    const chain = queryChain(doc);
    model.findById = jest.fn(() => chain);
    return chain;
  }

  function mockFindOne(doc: any) {
    const chain = queryChain(doc);
    model.findOne = jest.fn(() => chain);
    return chain;
  }

  beforeEach(async () => {
    const findById = jest.fn(() => queryChain({ save: jest.fn(async function () { return this; }) }));
    const findOne = jest.fn(() => queryChain(null));
    const find = jest.fn(() => queryChain([]));

    model = {
      create: jest.fn(async (data: any) => buildDoc(data)),
      findById,
      findOne,
      find,
      findByIdAndUpdate: jest.fn(async () => buildDoc({ pagado: true })),
    };
    events = { emitServicioUpdated: jest.fn() };
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ServiciosService,
        { provide: getModelToken('Servicio'), useValue: model },
        { provide: EventsGateway, useValue: events },
        { provide: AppLogger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(ServiciosService);
  });

  describe('create', () => {
    it('crea un servicio en estado PENDIENTE y emite evento', async () => {
      const dto = {
        equipoId: new Types.ObjectId().toString(),
        clienteId: new Types.ObjectId().toString(),
        tecnicoId: new Types.ObjectId().toString(),
        descripcion: 'Falla',
        costoEstimado: 50,
      };
      const created = buildDoc({ ...dto, estado: ServiceStatus.PENDIENTE });
      model.create = jest.fn(async () => created);
      mockFindById(created);
      const result = (await service.create(dto, admin.id))!;
      expect(model.create).toHaveBeenCalled();
      expect(result.estado).toBe(ServiceStatus.PENDIENTE);
      expect(events.emitServicioUpdated).toHaveBeenCalled();
    });
  });

  describe('findByCodigo', () => {
    it('lanza NotFound cuando no existe', async () => {
      mockFindOne(null);
      await expect(service.findByCodigo('MGS-XXX', admin.id)).rejects.toBeInstanceOf(
        NotFoundDomainException,
      );
    });
  });

  describe('findById', () => {
    it('lanza NotFound cuando el id no existe', async () => {
      mockFindById(null);
      await expect(service.findById(new Types.ObjectId().toString())).rejects.toBeInstanceOf(
        NotFoundDomainException,
      );
    });
  });

  describe('updateEstado', () => {
    it('permite transición válida PENDIENTE -> EN_REPARACION', async () => {
      const doc = buildDoc({ estado: ServiceStatus.PENDIENTE, tecnicoId: tecnico.id });
      mockFindById(doc);
      const result = (await service.updateEstado(
        doc._id.toString(),
        { estado: ServiceStatus.EN_REPARACION },
        admin,
      ))!;
      expect(result.estado).toBe(ServiceStatus.EN_REPARACION);
    });

    it('rechaza transición inválida PENDIENTE -> LISTO', async () => {
      const doc = buildDoc({ estado: ServiceStatus.PENDIENTE });
      mockFindById(doc);
      await expect(
        service.updateEstado(
          doc._id.toString(),
          { estado: ServiceStatus.LISTO },
          admin,
        ),
      ).rejects.toBeInstanceOf(BadRequestDomainException);
    });

    it('bloquea a técnico que no es dueño del servicio', async () => {
      const doc = buildDoc({
        estado: ServiceStatus.PENDIENTE,
        tecnicoId: new Types.ObjectId().toString(),
      });
      mockFindById(doc);
      await expect(
        service.updateEstado(
          doc._id.toString(),
          { estado: ServiceStatus.EN_REPARACION },
          { id: tecnico.id, role: UserRole.TECNICO },
        ),
      ).rejects.toBeInstanceOf(ForbiddenDomainException);
    });

    it('bloquea a cliente de cambiar estado', async () => {
      const doc = buildDoc({ estado: ServiceStatus.PENDIENTE });
      mockFindById(doc);
      await expect(
        service.updateEstado(
          doc._id.toString(),
          { estado: ServiceStatus.EN_REPARACION },
          { id: cliente.id, role: UserRole.CLIENTE },
        ),
      ).rejects.toBeInstanceOf(ForbiddenDomainException);
    });

    it('permite a admin revertir ENTREGADO -> LISTO', async () => {
      const doc = buildDoc({
        estado: ServiceStatus.ENTREGADO,
        pagado: true,
        tecnicoId: tecnico.id,
      });
      mockFindById(doc);
      const result = (await service.updateEstado(
        doc._id.toString(),
        { estado: ServiceStatus.LISTO },
        admin,
      ))!;
      expect(result.estado).toBe(ServiceStatus.LISTO);
    });

    it('bloquea a técnico revertir ENTREGADO -> LISTO', async () => {
      const doc = buildDoc({
        estado: ServiceStatus.ENTREGADO,
        pagado: true,
        tecnicoId: tecnico.id,
      });
      mockFindById(doc);
      await expect(
        service.updateEstado(
          doc._id.toString(),
          { estado: ServiceStatus.LISTO },
          { id: tecnico.id, role: UserRole.TECNICO },
        ),
      ).rejects.toBeInstanceOf(ForbiddenDomainException);
    });

    it('bloquea entrega sin pago', async () => {
      const doc = buildDoc({
        estado: ServiceStatus.LISTO,
        pagado: false,
        tecnicoId: tecnico.id,
      });
      mockFindById(doc);
      await expect(
        service.updateEstado(
          doc._id.toString(),
          { estado: ServiceStatus.ENTREGADO },
          admin,
        ),
      ).rejects.toBeInstanceOf(BadRequestDomainException);
    });

    it('lanza NotFound si el servicio no existe', async () => {
      mockFindById(null);
      await expect(
        service.updateEstado(
          new Types.ObjectId().toString(),
          { estado: ServiceStatus.EN_REPARACION },
          admin,
        ),
      ).rejects.toBeInstanceOf(NotFoundDomainException);
    });
  });

  describe('addObservacion', () => {
    it('agrega observación y emite evento', async () => {
      const doc = buildDoc();
      mockFindById(doc);
      const result = (await service.addObservacion(
        doc._id.toString(),
        { texto: 'Revisado', fase: ServiceStatus.EN_REPARACION },
        admin.id,
      ))!;
      expect(result.observaciones.length).toBe(1);
      expect(events.emitServicioUpdated).toHaveBeenCalled();
    });
  });

  describe('markAsPaid', () => {
    it('marca el servicio como pagado', async () => {
      const doc = buildDoc({ pagado: true });
      model.findByIdAndUpdate = jest.fn(async () => doc);
      mockFindById(doc);
      const result = (await service.markAsPaid(doc._id.toString()))!;
      expect(result.pagado).toBe(true);
    });
  });
});
