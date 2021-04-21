import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtribuirDesafioPartidaDTO } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDTO } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDTO } from './dtos/criar-desafio.dto';
import { DesafioStatus } from './interfaces/desafio-status.enum';
import { Desafio, Partida } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {

  private readonly logger = new Logger(DesafiosService.name);

  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private readonly categoriasService: CategoriasService,
    private readonly jogadoresService: JogadoresService
  ){}

  async criarDesafio(criarDesafioDTO: CriarDesafioDTO): Promise<Desafio> {

    const jogadores = await this.jogadoresService.consultarTodosJogadores()

    criarDesafioDTO.jogadores.map(jogadorDTO => {
      const jogadorFilter = jogadores.find(jogador => jogador._id == jogadorDTO._id)

      if(!jogadorFilter) {
        throw new BadRequestException(`O id ${jogadorDTO._id} não é um jogador!`)
      }
    })

    const solicitanteEhJogadorDaPartida = await criarDesafioDTO.jogadores.find(jogador => jogador._id == criarDesafioDTO.solicitante)

    if(!solicitanteEhJogadorDaPartida) {
      throw new BadRequestException(`O solicitante deve ser um jogador da partida!`)
    }

    const categoriaDoJogador = await this.categoriasService.consultarCategoriaDoJogador(criarDesafioDTO.solicitante)

    if(!categoriaDoJogador) {
      throw new BadRequestException(`O solicitante precisa estar registrado em uma categoria!`)
    }

    const desafioCriado = new this.desafioModel(criarDesafioDTO)
    desafioCriado.categoria = categoriaDoJogador.categoria
    desafioCriado.dataHoraSolicitacao = new Date()
    desafioCriado.status = DesafioStatus.PENDENTE
    // this.logger.log(desafioCriado)
    return await desafioCriado.save()
  }

  async consultarTodosDesafios() {
    return await this.desafioModel.find()
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec()
  }

  async consultarDesafioDeUmJogador(_id: any) {

    const jogadores = await this.jogadoresService.consultarTodosJogadores()

    const jogadorFilter = jogadores.find(jogador => jogador._id == _id)

    if(!jogadorFilter) {
      throw new BadRequestException(`O id ${_id} não é um jogador`)
    }

    return await this.desafioModel.find()
      .where('jogadores')
      .in(_id)
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec()

  }

  async atualizarDesafio(_id: string, atualizarDesafioDTO: AtualizarDesafioDTO): Promise<void> {
    
    const desafioEncontrado = await this.desafioModel.findById(_id).exec();
    
    if(!desafioEncontrado) {
      throw new NotFoundException(`Desafio ${_id} não encontrado`);
    }

    if(atualizarDesafioDTO.status) {
      desafioEncontrado.dataHoraResposta = new Date()
    }
    desafioEncontrado.status = atualizarDesafioDTO.status
    desafioEncontrado.dataHoraDesafio = atualizarDesafioDTO.dataHoraDesafio

    await this.desafioModel.findOneAndUpdate({ _id }, { $set: desafioEncontrado }).exec()
  }

  async atribuirDesafioPartida(_id: string, atribuirDesafioPartidaDTO: AtribuirDesafioPartidaDTO): Promise<void> {

    const desafioEncontrado = await this.desafioModel.findById(_id).exec()

    if(!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não cadastrado!`)
    }

    const jogadorFilter = desafioEncontrado.jogadores.find(jogador => jogador._id == atribuirDesafioPartidaDTO.def);

    if(!jogadorFilter) {
      throw new BadRequestException(`O jogador vencedor não faz parte do desafio!`)
    }

    const partidaCriada = new this.partidaModel(atribuirDesafioPartidaDTO)

    partidaCriada.categoria = desafioEncontrado.categoria
    partidaCriada.jogadores = desafioEncontrado.jogadores

    const resultado = await partidaCriada.save()

    desafioEncontrado.status = DesafioStatus.REALIZADO

    desafioEncontrado.partida = resultado._id

    try {
      await this.desafioModel.findOneAndUpdate({ _id }, { $set: desafioEncontrado }).exec()
    } catch (error) {
      await this.partidaModel.deleteOne({ _id: resultado._id }).exec();
      throw new InternalServerErrorException()
    }

  }

  async deletarDesafio(_id: string): Promise<void> {

    const desafioEncontrado = await this.desafioModel.findById(_id).exec()

    if(!desafioEncontrado) {
      throw new BadRequestException(`Desafio ${_id} não encontrado!`)
    }

    desafioEncontrado.status = DesafioStatus.CANCELADO

    await this.desafioModel.findOneAndUpdate({ _id }, { $set: desafioEncontrado }).exec()

  }

}
