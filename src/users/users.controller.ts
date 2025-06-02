import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('create-account')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAccount(createUserDto);
  }

  @Post('login')
  async login(@Body() data: any) {
    return this.usersService.login(data);
  }

  @Get('get-users')
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get('get-live-list')
  async getLiveList() {
    return this.usersService.getLiveList();
  }

  @Get('delete-user')
  async deleteUser(@Query('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }

  @Post('edit-user')
  async editUser(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.editUser(updateUserDto);
  }

}
