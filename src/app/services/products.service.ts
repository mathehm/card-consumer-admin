import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  isActive: boolean;
  createdAt: string | FirebaseTimestamp;
  updatedAt: string | FirebaseTimestamp;
}

export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  currentPrice: number;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  currentPrice?: number;
}

export interface CreateProductResponse {
  message: string;
  productId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Listar todos os produtos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // Listar apenas produtos ativos
  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/active`);
  }

  // Obter produto específico
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  // Criar novo produto
  createProduct(product: CreateProductRequest): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(`${this.apiUrl}/products`, product);
  }

  // Atualizar produto
  updateProduct(id: string, product: UpdateProductRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/products/${id}`, product);
  }

  // Remover produto (soft delete)
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Ativar produto
  activateProduct(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/products/${id}/activate`, {});
  }
}
