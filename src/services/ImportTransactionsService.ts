import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    try {
      const transactionsRepository = getCustomRepository(TransactionsRepository);
      const categoriesRepository = getRepository(Category);
      
      let stream = fs.createReadStream(filePath);
      const csvParsers = csvParse({ from_line: 2, });
      const parseCSV = stream.pipe(csvParsers);

      const transactionsDTO: TransactionDTO[] = [];
      const categories: string[] = [];

      parseCSV.on('data', async line => {
        const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

        if (!title || !type || !value) {
          throw new AppError(`Invalid data line "${line}"`);
        }

        categories.push(category);

        transactionsDTO.push({ title, type, value, category });
      });

      await new Promise(resolve => parseCSV.on('end', resolve));

        const existentCategories = await categoriesRepository.find({
          where: {
              title: In(categories),
          }
      });

      const existentCategoriesTitles = existentCategories.map(
          (category: Category) => category.title,
      );

      const addCategoryTitles = categories.filter(
          category => !existentCategoriesTitles.includes(category),
      ).filter(
          (value, index, self) => self.indexOf(value) === index
      );

      const newCategories = categoriesRepository.create(
          addCategoryTitles.map(title => ({
              title,
          })),
      );

      await categoriesRepository.save(newCategories);

      const finalCategories = [...newCategories, ...existentCategories];

      const createdTransactions = transactionsRepository.create(
          // create object transaction for every transaction in transactions array
          transactionsDTO.map(transaction => ({
              title: transaction.title,
              type: transaction.type,
              value: transaction.value,
              category: finalCategories.find(
                  // when category has same title as transaction category, pass this category from finalCategories
                  category => category.title === transaction.category,
              )
          })),
      );

      // bulk inserting a chunk of transactions
      await transactionsRepository.save(createdTransactions);

      return createdTransactions;
    }
    finally {
      await fs.promises.unlink(filePath);
    }
  }
}

export default ImportTransactionsService;
