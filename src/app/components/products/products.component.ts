

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  Category: Category;
}

interface ProductsResponse {
  totalItems: number;
  products: Product[];
  totalPages: number;
  currentPage: number;
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductService, ProductCreateDto } from '../../services/product.service';
import { RouterModule } from '@angular/router';

enum FormMode {
  None,
  Create,
  Edit
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  productsData: ProductsResponse | null = null;
  pageNumbers: number[] = [];
  pagination = {
    from: 0,
    to: 0
  };
  loading: boolean = false;
  error: string | null = null;
  
  // Form related properties
  formMode: FormMode = FormMode.None;
  FormMode = FormMode; // Expose enum to template
  productForm: FormGroup;
  categories: Category[] = [];
  currentProductId: number | null = null;
  formSubmitting = false;
  formError: string | null = null;
  formSuccess: string | null = null;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.loadProducts(0);
    this.loadCategories();
  }

  private createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      categoryId: ['', Validators.required]
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadProducts(pageIndex: number): void {
    this.loading = true;
    this.error = null;
    
    // Convert 0-based page index to 1-based for the API
    const apiPage = pageIndex + 1;
    
    this.productService.getProducts(apiPage).subscribe({
      next: (response: ProductsResponse) => {
        this.productsData = response;
        this.updatePagination();
        this.generatePageNumbers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
      }
    });
  }

  changePage(pageIndex: number): void {
    if (
      pageIndex < 0 || 
      (this.productsData && pageIndex >= this.productsData.totalPages)
    ) {
      return;
    }
    this.loadProducts(pageIndex);
  }

  generatePageNumbers(): void {
    if (!this.productsData) return;

    const totalPages = this.productsData.totalPages;
    const currentPage = this.productsData.currentPage;

    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    this.pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  }

  updatePagination(): void {
    if (!this.productsData) return;

    const itemsPerPage = this.productsData.products.length;
    const from = (this.productsData.currentPage + 1) * itemsPerPage - itemsPerPage + 1;
    const to = Math.min(
      from + itemsPerPage - 1,
      this.productsData.totalItems
    );

    this.pagination = { from, to };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  // Form related methods
  showCreateForm(): void {
    this.formMode = FormMode.Create;
    this.resetForm();
  }

  editProduct(id: number): void {
    this.formMode = FormMode.Edit;
    this.currentProductId = id;
    this.loadProductForEdit(id);
  }

  loadProductForEdit(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.setValue({
          name: product.name,
          description: product.description || '',
          categoryId: product.categoryId
        });
      },
      error: (err) => {
        console.error(`Error loading product ${id}:`, err);
        this.formError = 'Failed to load product details.';
      }
    });
  }

  cancelForm(): void {
    this.formMode = FormMode.None;
    this.resetForm();
  }

  resetForm(): void {
    this.productForm.reset();
    this.currentProductId = null;
    this.formError = null;
    this.formSuccess = null;
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.formSubmitting = true;
    this.formError = null;
    this.formSuccess = null;

    const productData: ProductCreateDto = this.productForm.value;
    
    if (this.formMode === FormMode.Create) {
      this.createProduct(productData);
    } else if (this.formMode === FormMode.Edit && this.currentProductId) {
      this.updateProduct(this.currentProductId, productData);
    }
  }

  createProduct(product: ProductCreateDto): void {
    this.productService.createProduct(product).subscribe({
      next: () => {
        this.formSubmitting = false;
        this.formSuccess = 'Product created successfully.';
        this.loadProducts(0); // Reload first page to show the new product
        setTimeout(() => {
          this.formMode = FormMode.None;
          this.resetForm();
        }, 2000);
      },
      error: (err) => {
        this.formSubmitting = false;
        console.error('Error creating product:', err);
        this.formError = 'Failed to create product.';
      }
    });
  }

  updateProduct(id: number, product: ProductCreateDto): void {
    const productToUpdate = {
      name:product.name,
      description:product.description,
      categoryId:product.categoryId,
    };
    this.productService.updateProduct(id, product).subscribe({
      next: () => {
        this.formSubmitting = false;
        this.formSuccess = 'Product updated successfully.';
        this.loadProducts(this.productsData?.currentPage || 0); // Reload current page
        setTimeout(() => {
          this.formMode = FormMode.None;
          this.resetForm();
        }, 2000);
      },
      error: (err) => {
        this.formSubmitting = false;
        console.error(`Error updating product ${id}:`, err);
        this.formError = 'Failed to update product.';
      }
    });
  }

  deleteProduct(id: number, categoryId:number): void {
    if (confirm(`Are you sure you want to delete product #${id}?`)) {
      const requestPayload = {
        categoryId: categoryId,
        id: id
      };
      this.productService.deleteProduct(requestPayload).subscribe({
        next: () => {
          // Reload the current page or handle success
          this.loadProducts(this.productsData?.currentPage || 0);
        },
        error: (err) => {
          console.error(`Error deleting product ${id}:`, err);
          // Handle error
        }
      });
    }
  }
}