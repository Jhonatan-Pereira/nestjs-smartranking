import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador } from 'src/jogadores/interfaces/jogador.interface';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtualizarCategoriaDTO } from './dtos/atualizar-categoria.dto';
import { CriarCategoriaDTO } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {

  private readonly logger = new Logger(CategoriasService.name);

  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
    private readonly jogadoresService: JogadoresService
  ) {}

  async criarCategoria(criarCategoriaDTO: CriarCategoriaDTO): Promise<Categoria> {
    const { categoria } = criarCategoriaDTO;

    const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec();

    if(categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} já cadastrada.`);
    }

    const categoriaCriada = new this.categoriaModel(criarCategoriaDTO);
    return await categoriaCriada.save();

  }

  async consultarTodasCategorias(): Promise<Categoria[]> {
    return await this.categoriaModel.find().populate('jogadores').exec();
  }

  async consultarCategoriaPeloId(categoria: string) {
    const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).populate('jogadores').exec()

    if(!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada!`)
    }

    return categoriaEncontrada
  }

  async consultarCategoriaDoJogador(_id: any): Promise<Categoria> {
    // const categorias = await this.categoriaModel.find().populate('jogadores').exec();

    // const categoriaDoJogador = categorias.find(categoria => {
    //   const jogadorEncontrado = categoria.jogadores.find(jogador => jogador._id == idJogador)
    //   if(jogadorEncontrado) return true
    //   return false
    // })

    // return categoriaDoJogador

    return await this.categoriaModel.findOne()
      .where('jogadores')
      .in(_id)
      .populate('solicitante')
      .populate('jogadores')
      .populate('partida')
      .exec()
  }

  async atualizarCategoria(categoria: string, atualizarCategoriaDTO: AtualizarCategoriaDTO) {

    const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec()

    if(!categoriaEncontrada) {
      throw new NotFoundException(`Categoria ${categoria} não encontrada!`)
    }

    await this.categoriaModel.findOneAndUpdate({ categoria }, { $set: atualizarCategoriaDTO }).exec()

  }

  async atribuirCategoriaJogador(params: string[]): Promise<void> {
    const categoria = params['categoria']
    const idJogador = params['idJogador']

    const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec()

    const jogadorJaCadastradoCategoria = await this.categoriaModel
      .find({ categoria })
      .where('jogadores')
      .in(idJogador)
      .exec()
    
    await this.jogadoresService.consultarJogadorPeloId(idJogador)

    if(!categoriaEncontrada) {
      throw new BadRequestException(`Categoria ${categoria} não encontrada!`)
    }

    if(jogadorJaCadastradoCategoria.length > 0) {
      throw new BadRequestException(`Jogador ${idJogador} já cadastrado na categoria ${categoria}!`)
    }

    categoriaEncontrada.jogadores.push(idJogador)
    await this.categoriaModel.findOneAndUpdate({ categoria }, { $set: categoriaEncontrada }).exec()

  }

}
