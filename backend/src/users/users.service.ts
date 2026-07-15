import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({ ...dto, password: hashed });
    return this.sanitize(user);
  }

  async findAll(role?: UserRole) {
    const filter = role ? { role, activo: true } : { activo: true };
    const users = await this.userModel.find(filter).select('-password').exec();
    return users;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, dto: UpdateUserDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.password) {
      update.password = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  sanitize(user: UserDocument) {
    const obj = user.toObject();
    delete (obj as { password?: string }).password;
    return obj;
  }
}
