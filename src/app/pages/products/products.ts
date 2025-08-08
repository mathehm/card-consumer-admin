import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProductsService, Product, CreateProductRequest, UpdateProductRequest, FirebaseTimestamp } from '../../services/products.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule, 
    FormsModule,
    NzTableModule, 
    NzButtonModule, 
    NzIconModule, 
    NzEmptyModule, 
    NzPopconfirmModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzSwitchModule,
    NzTagModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Products implements OnInit {
  products: Product[] = [];
  loading = false;
  isModalVisible = false;
  isEditMode = false;
  currentProduct: Product | null = null;

  // Form data
  productForm: CreateProductRequest = {
    name: '',
    category: '',
    currentPrice: 0
  };

  constructor(
    private productsService: ProductsService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        this.cdr.markForCheck();
        // Não mostrar mensagem de sucesso no carregamento inicial
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.message.error('Erro ao carregar produtos');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  reloadProducts(successMessage?: string) {
    this.loading = true;
    this.cdr.markForCheck();
    
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        if (successMessage) {
          this.message.success(successMessage);
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.message.error('Erro ao carregar produtos');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentProduct = null;
    this.productForm = {
      name: '',
      category: '',
      currentPrice: 0
    };
    this.isModalVisible = true;
  }

  openEditModal(product: Product) {
    this.isEditMode = true;
    this.currentProduct = product;
    this.productForm = {
      name: product.name,
      category: product.category,
      currentPrice: product.currentPrice
    };
    this.isModalVisible = true;
  }

  handleCancel() {
    this.isModalVisible = false;
    this.currentProduct = null;
    this.productForm = {
      name: '',
      category: '',
      currentPrice: 0
    };
  }

  handleOk() {
    if (this.isEditMode && this.currentProduct) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    this.productsService.createProduct(this.productForm).subscribe({
      next: (response) => {
        this.isModalVisible = false;
        this.reloadProducts('Produto criado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar produto:', error);
        this.message.error('Erro ao criar produto');
      }
    });
  }

  updateProduct() {
    if (!this.currentProduct) return;

    const updateData: UpdateProductRequest = {
      name: this.productForm.name,
      category: this.productForm.category,
      currentPrice: this.productForm.currentPrice
    };

    this.productsService.updateProduct(this.currentProduct.id, updateData).subscribe({
      next: () => {
        this.isModalVisible = false;
        this.reloadProducts('Produto atualizado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao atualizar produto:', error);
        this.message.error('Erro ao atualizar produto');
      }
    });
  }

  deleteProduct(id: string) {
    this.productsService.deleteProduct(id).subscribe({
      next: () => {
        this.reloadProducts('Produto excluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao deletar produto:', error);
        this.message.error('Erro ao excluir produto');
      }
    });
  }

  activateProduct(id: string) {
    this.productsService.activateProduct(id).subscribe({
      next: () => {
        this.reloadProducts('Produto ativado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao ativar produto:', error);
        this.message.error('Erro ao ativar produto');
      }
    });
  }

  formatDate(dateString: string | any): string {
    // Se for um timestamp do Firebase
    if (dateString && typeof dateString === 'object' && dateString._seconds) {
      const date = new Date(dateString._seconds * 1000);
      return date.toLocaleString('pt-BR');
    }
    // Se for uma string ISO
    if (typeof dateString === 'string') {
      return new Date(dateString).toLocaleString('pt-BR');
    }
    return 'Data inválida';
  }
}
