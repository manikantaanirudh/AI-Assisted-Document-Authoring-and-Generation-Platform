import api from './api';

export interface GenerateRequest {
  project_id: string;
  section_id: string;
}

export interface GenerateResponse {
  section_id: string;
  content: string;
  llm_raw: string;
  message: string;
}

export interface RefineRequest {
  project_id: string;
  section_id: string;
  prompt: string;
}

export interface RefineResponse {
  section_id: string;
  old_content: string;
  new_content: string;
  revision_id: string;
  message: string;
}

export const generationService = {
  async generateSection(data: GenerateRequest): Promise<GenerateResponse> {
    const response = await api.post<GenerateResponse>('/generate/section', data);
    return response.data;
  },

  async refineSection(data: RefineRequest): Promise<RefineResponse> {
    const response = await api.post<RefineResponse>('/refine/section', data);
    return response.data;
  },
};

