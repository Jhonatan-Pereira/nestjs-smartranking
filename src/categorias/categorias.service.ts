import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtualizarCategoriaDTO } from './dtos/atualizar-categoria.dto';
import { CriarCategoriaDTO } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {

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
