import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AtualizarCategoriaDTO } from './dtos/atualizar-categoria.dto';
import { CriarCategoriaDTO } from './dtos/criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {

  constructor(
    @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>
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
    return await this.categoriaModel.find().exec();
  }

  async consultarCategoriaPeloId(categoria: string) {
    const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec()

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

}
