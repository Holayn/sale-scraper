import { ISelectors } from './scrape';

export interface ISiteConfig {
  id: string;
  selectors: ISelectors;
  url: string;
  name: string;
}

export interface IUserJob {
  id: string;
  keywords: string[];
  user: string;
  siteConfigId: string;
}

export interface IResource {
  getUserJobs: (userId: string) => Promise<IUserJob[] | undefined>;
  getSiteConfigs: () => Promise<ISiteConfig[] | undefined>;
}

export async function getSiteConfigs(resource: IResource) {
  try {
    const configs = await resource.getSiteConfigs();
    return configs ?? [];
  } catch (e) {
    throw e;
  }
}

export async function getUserJobs(resource: IResource, userId: string) {
  try {
    const configs = await resource.getUserJobs(userId);
    return configs ?? [];
  } catch (e) {
    throw e;
  }
}
