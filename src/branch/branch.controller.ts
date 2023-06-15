import { Controller, Get, Query, Post, Body, Param, ParseUUIDPipe, UseGuards, Patch, Req } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto, FindBranchesDto } from './dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Branch } from './branch.entity';
import { Request } from 'express';

@Controller('branch')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @UseGuards(JwtAuthGuard)
  @Get('headequater')
  public findMyHeadquaters(@Req() req: Request): Promise<Branch[]> {
    return this.branchService.findMyHeadquaters(req.user.id);
  }

  @Get(':slug')
  public findOne(@Param('slug') slug: string): Promise<Branch> {
    return this.branchService.findOne(slug);
  }

  @Get()
  public find(@Query() findBranchesDto: FindBranchesDto): Promise<Branch[]> {
    return this.branchService.find(findBranchesDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  public create(@Body() createBranchDto: CreateBranchDto, @Req() req: Request): Promise<Branch> {
    return this.branchService.create(createBranchDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBranchDto: UpdateBranchDto): Promise<Branch> {
    return this.branchService.update(id, updateBranchDto);
  }
}
