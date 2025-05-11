import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEY, ERROR_MESSAGES } from '../config';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              store.dispatch(logout());
              return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
            case 403:
              return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));
            case 404:
              return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));
            case 500:
              return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
            default:
              return Promise.reject(error);
          }
        }
        if (error.request) {
          return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }
}

export const httpClient = new HttpClient(); 