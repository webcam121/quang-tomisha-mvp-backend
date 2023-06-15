import { Controller, UseGuards, Get, Query, Req, Param, Patch, Body, Res } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { PublicJwtAuthGuard } from 'src/auth/jwt-public.guard';
import { UserService } from './user.service';
import { User } from './user.entity';
import { SearchUserDto, SearchUsersDto, FindUserDto, PatchUsersDto } from './dto';
import { Request, Response } from 'express';
import { AdminJwtAuthGuard } from 'src/auth/jwt-admin.guard';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public search(@Query() searchUsersDto: SearchUsersDto, @Req() req: Request) {
    return this.userService.search(searchUsersDto, req.user.id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('list')
  public list(@Query() searchUsersDto: SearchUsersDto) {
    return this.userService.list(searchUsersDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('single')
  public searchOne(@Query() searchUserDto: SearchUserDto, @Req() req: Request) {
    return this.userService.searchOne(searchUserDto, req.user.id)
  }

  @UseGuards(PublicJwtAuthGuard)
  @Get(':slug')
  public findOneBySlug (@Param('slug') slug: string, @Query() findUserDto: FindUserDto, @Req() req: Request): Promise<User> {
    return this.userService.findOne({ slug, ...findUserDto }, req.user);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch()
  public async patchUsers (@Body() patchUsersDto: PatchUsersDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const i = patchUsersDto.ids.indexOf(req.user.id);
    if (i !== -1) {
      patchUsersDto.ids.splice(i, 1);
    }

    await this.userService.patchUsers(patchUsersDto);
    res.sendStatus(200);
  }
}
