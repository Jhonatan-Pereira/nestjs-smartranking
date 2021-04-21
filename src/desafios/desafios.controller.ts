import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { AtribuirDesafioPartidaDTO } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDTO } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDTO } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';
import { DesafioStatusValidacaoPipe } from './pipes/desafio-status-validacao.pipe';

@Controller('api/v1/desafios')
export class DesafiosController {

  constructor(private readonly desafiosService: DesafiosService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(
    @Body() criarDesafioDTO: CriarDesafioDTO
  ): Promise<Desafio> {
    return await this.desafiosService.criarDesafio(criarDesafioDTO)
  }

  @Get()
  async consultarDesafios(
    @Query('idJogador') _id: string
  ): Promise<Desafio[]> {
    return _id ? await this.desafiosService.consultarDesafioDeUmJogador(_id)
    : await this.desafiosService.consultarTodosDesafios()
  }

  @Put('/:desafio')
  async atualizarDesafio(
    @Body(DesafioStatusValidacaoPipe) atualizarDesafioDTO: AtualizarDesafioDTO,
    @Param('desafio') _id: string
  ): Promise<void> {
    await this.desafiosService.atualizarDesafio(_id, atualizarDesafioDTO)
  }

  @Post('/:desafio/partida/')
  async atribuirDesafioPartida(
    @Body(ValidationPipe) atribuirDesafioPartidaDTO: AtribuirDesafioPartidaDTO,
    @Param('desafio') _id: string
  ): Promise<void> {
    return await this.desafiosService.atribuirDesafioPartida(_id, atribuirDesafioPartidaDTO)
  }

  @Delete('/:_id')
  async deletarDesafio(
    @Param('_id') _id: string
    ): Promise<void> {
    this.desafiosService.deletarDesafio(_id)
  }
}
