// src/app/components/category/category.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';



@Component({
        selector: 'app-category',
        templateUrl: './category.component.html',
        styleUrls: ['./category.component.css'],
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule
        ]
    })
    export class CategoryComponent implements OnInit {
        categories: Category[] = [];
        categoryForm: FormGroup;
        isLoading = false;
        isEditing = false; 
        editingCategoryId: number | null = null;

        constructor(
            private categoryService: CategoryService,
            private fb: FormBuilder
          ) {
            this.categoryForm = this.fb.group({
              categoryName: ['', [Validators.required]],
              description: ['']
            });
        }

        ngOnInit(): void {
            this.loadCategories();
          }

          loadCategories(): void {
            this.isLoading = true;
            this.categoryService.getCategories().subscribe({
              next: (data) => {
                this.categories = data;
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Error fetching categories:', err);
                this.isLoading = false;
              }
            });
          }

          onSubmit(): void {
            if (this.categoryForm.valid) {
              const categoryData: Partial<Category> = {
                name: this.categoryForm.value.categoryName,
                description: this.categoryForm.value.description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
          
              if (this.isEditing && this.editingCategoryId !== null) {
                // Update Category (Include ID)
                this.categoryService.updateCategory({ id: this.editingCategoryId, ...categoryData } as Category)
                  .subscribe(() => {
                    alert('Category updated successfully!');
                    this.resetForm();
                    this.loadCategories();
                  });
              } else {
                // Create New Category (DO NOT SEND ID)
                this.categoryService.createCategory(categoryData as Category).subscribe(() => {
                  alert('Category created successfully!');
                  this.resetForm();
                  this.loadCategories();
                });
              }
            }
          }

          resetForm(): void {
            this.isEditing = false;
            this.editingCategoryId = null;
            this.categoryForm.reset();
          }

          editCategory(category: Category): void {
            this.categoryForm.patchValue({
              categoryName: category.name,
              description: category.description
            });
            this.isEditing = true;
            this.editingCategoryId = category.id;
          }

          deleteCategory(id: number): void {
            if (confirm('Are you sure you want to delete this category?')) {
              this.categoryService.deleteCategory(id).subscribe(() => {
                this.categories = this.categories.filter(c => c.id !== id);
                alert('Category deleted successfully!');
              });
            }
          }
    }
    