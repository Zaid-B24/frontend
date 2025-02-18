
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  Category: Category;
}

export interface ProductsResponse {
  totalItems: number;
  products: Product[];
  totalPages: number;
  currentPage: number;
}

export interface ProductCreateDto {
  name: string;
  description?: string;
  categoryId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://node-rdbms-task.onrender.com';
  private productsUrl = `${this.baseUrl}/products`;
  private categoriesUrl = `${this.baseUrl}/categories`;

  constructor(private http: HttpClient) {}

  getProducts(page: number = 1, limit: number = 10): Observable<ProductsResponse> {
    // Ensure page is always at least 1 for the API
    const pageParam = Math.max(1, page);
    
    const params = new HttpParams()
      .set('page', pageParam.toString())
      .set('limit', limit.toString());
      
    return this.http.get<ProductsResponse>(this.productsUrl, { params })
      .pipe(
        // Convert the API's 1-based pagination to 0-based for our component
        map(response => ({
          ...response,
          currentPage: response.currentPage - 1
        }))
      );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`);
  }

  createProduct(product: ProductCreateDto): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, product);
  }

  updateProduct(id: number, product: Partial<ProductCreateDto>): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, product);
  }

  deleteProduct(payload: {categoryId: number, id: number}): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}`, {body:payload});
  }
}