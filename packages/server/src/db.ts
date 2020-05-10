import mongoose from 'mongoose';
import { ISelectors } from './scrape';
import { IResource, ISiteConfig, IUserJob } from './fetcher';

require('dotenv').config();

const url = process.env.DB_URL;
const options = {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

interface ISiteConfigResponseItem {
  _id: string;
  _doc: ISiteConfig;
}
interface IUserJobResponseItem {
  _id: string;
  _doc: IUserJob;
}

function modelFactory(name: string, properties: Record<string, any>, collection: string) {
  const schema = new mongoose.Schema(properties, {collection});
  const model = mongoose.model(name, schema);
  return model;
}

export class DB implements IResource {
  connection: any;

  siteConfigModel: any;
  userJobModel: any;

  constructor() {
    this.siteConfigModel = modelFactory('SiteConfig', {
      selectors: {
        productSelector: String,
        productName: String,
        originalPrice: String,
        salePrice: String,
        size: String,
      } as Record<keyof ISelectors, StringConstructor>,
      url: String,
      name: String,
    }, 'site-configs');

    this.userJobModel = modelFactory('UserJob', {
      keywords: [String],
      userId: String,
      siteConfigId: String,
    }, 'user-jobs');
  }

  async connect() {
    if (this.connection) {
      return this.connection;
    }
    try {
      this.connection = await mongoose.connect(url!, options);
      console.info('connected to db');
    } catch (e) {
      throw new Error(`something went wrong trying to connect to the db: ${e}`);
    }
  }

  async getSiteConfigs() {
    try {
      if (!this.connection) {
        throw new Error('no connection to db');
      }

      const querySiteConfigs = this.siteConfigModel.find({});
      const resSiteConfigs: ISiteConfigResponseItem[] = await querySiteConfigs.exec();
      return resSiteConfigs.map((resSiteConfig: ISiteConfigResponseItem) => {
        return {
          ...resSiteConfig._doc,
          id: resSiteConfig._id,
        } as ISiteConfig;
      });
    } catch (e) {
      throw new Error(`something went wrong with fetching: ${e}`);
    }
  }

  async getUserJobs(userId: string) {
    try {
      if (!this.connection) {
        throw new Error('no connection to db');
      }

      const queryUserJobs = this.userJobModel.find({
        userId,
      });
      const resUserJobs: IUserJobResponseItem[] = await queryUserJobs.exec();
      return resUserJobs.map((resUserJob: IUserJobResponseItem) => {
        return {
          ...resUserJob._doc,
          id: resUserJob._id,
        } as IUserJob;
      })
    } catch (e) {
      throw new Error(`something went wrong with fetching: ${e}`);
    }
  }
}
