import { ISelectors } from './scrape';

export interface IJob {
  selectors: ISelectors;
  keywords: string[];
  url: string;
  user: number;
  id: string;
}

interface IResource {
  getJobs: () => Promise<IJob[] | undefined>;
}

export async function getScrapingJob(resource: IResource) {
  try {
    const jobs = await resource.getJobs();
    const { id, url, selectors, keywords } = jobs?.[0] ?? {};
    if (!url || !selectors || !keywords || !id) {
      throw new Error('missing job info');
    }
    return {
      id,
      url,
      selectors,
      keywords,
    };
  } catch (e) {
    throw e;
  }
}
