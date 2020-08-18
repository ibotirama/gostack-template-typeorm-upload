import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from "../repositories/TransactionsRepository";
import Transaction from '../models/Transaction';
class DeleteTransactionService {
  public async execute(id: string): Promise<Transaction | any> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionsRepository.findOne(id);
    if(!transaction){
      throw new AppError(`Transaction not found with id ${id}`);
    }

    const results = await transactionsRepository.delete(id);
    return results;
  }
}

export default DeleteTransactionService;
