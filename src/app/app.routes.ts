import { Routes } from '@angular/router';
import { CategoryComponent } from './components/category/category.component';
import { ProductsComponent } from './components/products/products.component';


export const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' }, // Redirect root to /products
    { path: 'categories', component: CategoryComponent }, // Category page
    { path: 'products', component: ProductsComponent }, // Product page
  ];
