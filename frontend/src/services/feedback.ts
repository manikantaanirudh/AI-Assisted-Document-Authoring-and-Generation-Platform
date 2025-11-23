import api from './api';

export interface FeedbackCreate {
  project_id: string;
  section_id: string;
  liked: boolean;
}

export interface Feedback {
  id: string;
  section_id: string;
  project_id: string;
  user_id: string;
  liked: boolean;
  created_at: string;
}

export interface CommentCreate {
  project_id: string;
  section_id: string;
  comment_text: string;
}

export interface Comment {
  id: string;
  section_id: string;
  project_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
}

export const feedbackService = {
  async submitFeedback(data: FeedbackCreate): Promise<Feedback> {
    const response = await api.post<Feedback>('/feedback', data);
    return response.data;
  },

  async addComment(data: CommentCreate): Promise<Comment> {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  },
};

