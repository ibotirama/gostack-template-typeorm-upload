import { getRepository, getCustomRepository } from "typeorm";
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from "../models/Category";
import TransactionsRepository from "../repositories/TransactionsRepository";

interface RequestDTO {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,
}
class CreateTransactionService {
  public async execute({ title, value, type, category }: RequestDTO): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    let categoryFromDb = await categoriesRepository.findOne({ where: { title: category } });
    if (!categoryFromDb) {
      categoryFromDb = categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryFromDb);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      
      if (value > balance.income) {
        throw new AppError('The outcome value can not be greater then the total incomes.');
      }
    }

    const transaction = transactionsRepository.create({ title, value, type, category: categoryFromDb });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
