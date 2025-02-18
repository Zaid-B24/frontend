import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';  // 'of' is used to return an observable of the mock data
import { Category } from '../models/category'; // Import your Category model
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  private apiUrl = 'https://node-rdbms-task.onrender.com/categories';

  constructor(private http: HttpClient) { }

  // Get all categories (API)
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl); 
  }

  // Get a single category by ID
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    const { id, ...categoryData } = category;
    return this.http.post<Category>(this.apiUrl, category);
  }

  
// Update an existing category
updateCategory(category: Category): Observable<Category> {
  return this.http.put<Category>(`${this.apiUrl}/${category.id}`, category);
}

 // Delete a category by ID
 deleteCategory(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}
}
