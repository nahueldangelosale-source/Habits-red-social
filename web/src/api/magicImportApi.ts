import { api } from './client';

export interface AsyncImportResponse {
    task_id: string;
    status: string;
    message: string;
}

export interface TaskStatusResponse<T = any> {
    task_id: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'STARTED' | 'RETRY';
    successful: boolean;
    result?: T;
    error?: string;
}

export const uploadMagicImport = async (file: File, tenantId: string): Promise<AsyncImportResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('tenant_id', tenantId);

    return api.post<AsyncImportResponse>('/magic-import/upload', formData);
};


export const checkTaskStatus = async <T = any>(taskId: string): Promise<TaskStatusResponse<T>> => {
    return api.get<TaskStatusResponse<T>>(`/tasks/${taskId}`);
};
