import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CriarJogadorDTO } from './dto/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JogadoresService {

  // private jogadores: Jogador[] = [];

  constructor(
    @InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>
  ) {}

  private readonly logger = new Logger(JogadoresService.name);

  async criarAtualizarJogador(criarJogadorDTO: CriarJogadorDTO): Promise<void> {

    this.logger.log(`criaJogadorDTO: ${JSON.stringify(criarJogadorDTO)}`)
    
    const { email } = criarJogadorDTO
    
    // const jogadorEncontrado = this.jogadores.find(jogador => jogador.email == email)

    const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec()

    if(jogadorEncontrado) {
      this.atualizar(criarJogadorDTO)
    } else {
      this.criar(criarJogadorDTO)
    }
  }

  async consultarTodosJogadores(): Promise<Jogador[]> {
    // return this.jogadores
    return await this.jogadorModel.find().exec()
  }

  async consultaJogadorPorEmail(email: string): Promise<Jogador> {
    // const jogador = this.jogadores.find(jogador => jogador.email == email)
    const jogador = await this.jogadorModel.findOne({ email }).exec()
    if(!jogador) {
      throw new NotFoundException(`Jogador com e-mail ${email} não encontrado.`)
    }
    return jogador
  }

  async deletarJogadorPorEmail(email: string): Promise<any> {
    return await this.jogadorModel.remove({email}).exec()
    /*
    const jogador = this.jogadores.find(jogador => jogador.email == email)
    if(!jogador) {
      throw new NotFoundException(`Jogador com e-mail ${email} não encontrado.`)
    }
    this.jogadores = this.jogadores.filter(jogador => jogador.email != email)
    */
  }

  private async criar(criarJogadorDTO: CriarJogadorDTO): Promise<Jogador> {
    
    const jogadorCriado = new this.jogadorModel(criarJogadorDTO)
    return await jogadorCriado.save()
    /*
    const { nome, email, telefoneCelular } = criarJogadorDTO
    const jogador: Jogador = {
      _id: uuidv4(),
      email,
      nome,
      telefoneCelular,
      posicaoRanking: 1,
      ranking: "A",
      urlFotoJogador: ""
    }
    this.jogadores.push(jogador)
    this.logger.log(`criaJogadorDTO: ${JSON.stringify(this.jogadores)}`)
    */
  }

  private async atualizar(criarJogadorDTO: CriarJogadorDTO): Promise<Jogador> {
    const { email } = criarJogadorDTO
    return await this.jogadorModel.findOneAndUpdate({ email }, { $set: criarJogadorDTO }).exec()
    /*
    const { nome } = criarJogadorDTO
    jogadorEncontrado.nome = nome
    */
  }
}
