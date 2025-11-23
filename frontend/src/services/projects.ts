import api from './api';

export type DocumentType = 'docx' | 'pptx';

export interface Section {
  id: string;
  type: string;
  order_index: number;
  title: string;
  content?: string;
  llm_raw?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  doc_type: DocumentType;
  topic: string;
  created_at: string;
  updated_at: string;
  sections: Section[];
}

export interface ProjectCreate {
  title: string;
  doc_type: DocumentType;
  topic: string;
}

export interface SectionCreate {
  title: string;
  order_index: number;
}

export const projectService = {
  async listProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<ProjectCreate>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async createSection(projectId: string, data: SectionCreate): Promise<Section> {
    const response = await api.post<Section>(`/projects/${projectId}/sections`, data);
    return response.data;
  },

  async updateSection(projectId: string, sectionId: string, data: Partial<SectionCreate & { content?: string }>): Promise<Section> {
    const response = await api.put<Section>(`/projects/${projectId}/sections/${sectionId}`, data);
    return response.data;
  },

  async deleteSection(projectId: string, sectionId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/sections/${sectionId}`);
  },
};

