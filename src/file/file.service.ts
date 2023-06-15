import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserFileDto, UpdateUserFileDto } from './dto';
import { File } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
  ) {}

  public findMyFiles(authUserId: string): Promise<File[]> {
    return this.fileRepo.find({ userId: authUserId });
  }

  public createMyFile(createUserFileDto: CreateUserFileDto, authUserId: string): Promise<File> {
    const file = this.fileRepo.create(createUserFileDto);
    file.userId = authUserId;

    return this.fileRepo.save(file);
  }

  public async updateMyFile(id: number, updateUserFileDto: UpdateUserFileDto, authUserId: string): Promise<File> {
    const file = await this.fileRepo.findOneOrFail({
      userId: authUserId,
      id,
    });

    Object.assign(file, updateUserFileDto);

    return this.fileRepo.save(file);
  }

  public async removeMyFile(id: number, authUserId: string): Promise<void> {
    await this.fileRepo.delete({ id, userId: authUserId });
  }
}
