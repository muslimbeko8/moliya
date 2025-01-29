import { Injectable } from '@nestjs/common';
import { CreateCategyDto } from './dto/create-categy.dto';
import { UpdateCategyDto } from './dto/update-categy.dto';
import { Categories } from './categories.modul';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories) private readonly categoryModel: typeof Categories,
  ) {}

  create(createCategyDto: CreateCategyDto) {
    const nimadir = this.findName(createCategyDto.name);
    if (nimadir) {
      return 'Bu categoriya allaqachon mavjud';
    }
    return this.categoryModel.create(createCategyDto);
  }

  findAll() {
    return this.categoryModel.findAll();
  }

  findOne(id: number) {
    const category = this.categoryModel.findByPk(id);
    if (!category) {
      return 'Bunday categoriya mavjud emas';
    }
    return category;
  }
  async update(id: number, updateCategyDto: UpdateCategyDto) {
    const [affectedRows] = await this.categoryModel.update(updateCategyDto, {
      where: { id },
    });

    if (affectedRows > 0) {
      return this.categoryModel.findByPk(id);
    } else {
      return 'Bunday categoriya mavjud emas';
    }
  }

  remove(id: number) {
    return this.categoryModel.destroy({ where: { id } });
  }
  findName(name: string) {
    return this.categoryModel.findOne({ where: { name } });
  }
}
