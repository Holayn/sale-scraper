import { ISelectors } from './scrape';

export interface ISiteConfig {
  id: string;
  selectors: ISelectors;
  url: string;
  name: string;
  dynamicScrolling: boolean;
}

export interface IUserJob {
  id: string;
  keywords: string[];
  excludeKeywords: string[];
  user: string;
  siteConfigId: string;
  email: string;
}

export interface IResource {
  getUserJobs: (query: Record<string, any>, userId?: string) => Promise<IUserJob[] | undefined>;
  getSiteConfigs: () => Promise<ISiteConfig[] | undefined>;
}

export async function fetchSiteConfigs(resource: IResource) {
  try {
    const configs = await resource.getSiteConfigs();
    return configs ?? [];
  } catch (e) {
    throw e;
  }
}

export async function fetchUserJobs(resource: IResource, userId: string) {
  try {
    const configs = await resource.getUserJobs({
      userId,
    });
    return configs ?? [];
  } catch (e) {
    throw e;
  }
}

export async function fetchAllUsersJobs(resource: IResource) {
  try {
    const configs = await resource.getUserJobs({});
    return configs ?? [];
  } catch (e) {
    throw e;
  }
}
