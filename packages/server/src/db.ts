import mongoose from 'mongoose';
import { ISelectors } from './scrape';

require('dotenv').config();

const url = process.env.DB_URL;
const options = {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

interface IJobModelItem {
  selectors: ISelectors;
  keywords: string[];
  url: string;
  user: number;
}

interface IResponseItem {
  _id: string;
  _doc: IJobModelItem;
}

export class DB {
  connection: any;
  jobSchema: mongoose.Schema;
  jobModel: any;

  constructor() {
    this.jobSchema = new mongoose.Schema({
      selectors: {
        productSelector: String,
        productName: String,
        originalPrice: String,
        salePrice: String,
        size: String,
      } as Record<keyof ISelectors, StringConstructor>,
      keywords: [String],
      url: String,
      user: Number,
    });

    this.jobModel = mongoose.model('Job', this.jobSchema);
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(url!, options);
      console.info('connected to db');
    } catch (e) {
      throw new Error(`something went wrong trying to connect to the db: ${e}`);
    }
  }

  async getJobs() {
    try {
      if (!this.connection) {
        throw new Error('no connection to db');
      }

      const query = this.jobModel.find({});
      const res = await query.exec();

      return res.map((job: IResponseItem) => {
        return {
          ...job._doc,
          id: job._id,
        };
      });
    } catch (e) {
      throw new Error(`something went wrong with fetching: ${e}`);
    }
  }
}
