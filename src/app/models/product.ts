import { Category } from "./category";


export interface Product {
    id: number;
    name: string;
    totalItems?: number;
    description?: string;
    categoryId: number;
    category?: Category
  }
  
