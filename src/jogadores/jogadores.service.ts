import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AtualizarJogadorDTO } from './dtos/atualizar-jogador.dto';
import { CriarJogadorDTO } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';

@Injectable()
export class JogadoresService {

  constructor(
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarJogador(criarJogadorDTO: CriarJogadorDTO): Promise<Jogador> {    
    const { email } = criarJogadorDTO
    
    const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec()

    if(jogadorEncontrado) {
      throw new BadRequestException(`Jogador com e-mail ${email} já cadastrado.`)
    }

    const jogadorCriado = new this.jogadorModel(criarJogadorDTO)
    return await jogadorCriado.save()
  }

  async atualizarJogador(_id: string, atualizarJogadorDTO: AtualizarJogadorDTO): Promise<void> {        
    const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec()

    if(!jogadorEncontrado) {
      throw new NotFoundException(`Jogador com id ${_id} não encontrado.`)
    }

    await this.jogadorModel.findOneAndUpdate({ _id }, { $set: atualizarJogadorDTO }).exec()
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    return await this.jogadorModel.find().exec()
  }

  async consultarJogadorPeloId(_id: string): Promise<Jogador> {
    const jogador = await this.jogadorModel.findOne({ _id }).exec()
    if(!jogador) {
      throw new NotFoundException(`Jogador com id ${_id} não encontrado.`)
    }
    return jogador
  }

  async deletarJogadorPorEmail(_id: string): Promise<any> {
    const jogador = await this.jogadorModel.findOne({ _id }).exec()
    if(!jogador) {
      throw new NotFoundException(`Jogador com id ${_id} não encontrado.`)
    }
    return await this.jogadorModel.deleteOne({_id}).exec()
  }
}
