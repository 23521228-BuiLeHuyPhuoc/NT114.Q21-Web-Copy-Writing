import { contentService } from '@/services/contentService';

export const historyService = {
  async list() {
    return contentService.list({ fetchAll: true, limit: 100 });
  },
};
