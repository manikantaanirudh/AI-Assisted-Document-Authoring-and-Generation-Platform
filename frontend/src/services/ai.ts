import api from './api';

export interface SuggestOutlineRequest {
  topic: string;
  doc_type: 'docx' | 'pptx';
  num_items?: number;
}

export interface SuggestOutlineResponse {
  items: string[];
  message: string;
}

export const aiService = {
  async suggestOutline(data: SuggestOutlineRequest): Promise<SuggestOutlineResponse> {
    const response = await api.post<SuggestOutlineResponse>('/ai/suggest-outline', data);
    return response.data;
  },
};

