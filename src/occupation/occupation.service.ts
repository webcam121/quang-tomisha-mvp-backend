import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occupation } from './occupation.entity';
import { CreateOccupationDto, UpdateOccupationDto } from './dto';
import { AuthUser } from 'src/auth/type/auth-user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OccupationService {
  constructor(
    @InjectRepository(Occupation)
    public occupationRepo: Repository<Occupation>,
  ) {}

  public findMyOccupations(authUser: AuthUser): Promise<Occupation[]> {
    return this.occupationRepo.find({
      where: {
        userId: authUser.id,
      },
      relations: ['profession'],
    });
  }

  public async findOne(slug: string): Promise<Occupation> {
    const occupation = await this.occupationRepo.findOneOrFail({
      where: { slug },
      relations: [
        'profession',
        'hardSkills',
        'hardSkills.skill',
        'preferences',
        'employments',
        'employments.profession',
        'employments.files',
        'employments.branch',
        'employments.branch.addresses',
      ],
    });

    return occupation;
  }

  public create(createOccupationDto: CreateOccupationDto, authUser: AuthUser): Promise<Occupation> {
    const occupation = this.occupationRepo.create(createOccupationDto);
    occupation.userId = authUser.id;

    return this.occupationRepo.save(occupation);
  }

  public async update(id: string, authUserId: string, updateOccupationDto: UpdateOccupationDto): Promise<Occupation> {
    await this.occupationRepo.findOneOrFail({
      where: { userId: authUserId, id },
      select: ['id'],
    });

    const occupation = this.occupationRepo.create(updateOccupationDto);
    occupation.id = id;

    return this.occupationRepo.save(occupation);
  }
}
