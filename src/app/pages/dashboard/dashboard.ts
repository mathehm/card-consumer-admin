import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { forkJoin } from 'rxjs';
import { ProductsService, Product } from '../../services/products.service';
import { ReportsService, SalesTodayResponse, ProductSales } from '../../services/reports.service';

interface DashboardSummary {
  activeProducts: number;
  totalProducts: number;
  totalSalesToday: number;
  totalRevenueToday: number;
}

interface ProductStats {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  category?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  loading = false;
  summary: DashboardSummary = {
    activeProducts: 0,
    totalProducts: 0,
    totalSalesToday: 0,
    totalRevenueToday: 0
  };
  
  productStats: ProductStats[] = [];
  salesToday: SalesTodayResponse | null = null;

  constructor(
    private productsService: ProductsService,
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      products: this.productsService.getProducts(),
      salesToday: this.reportsService.getSalesToday()
    }).subscribe({
      next: ({ products, salesToday }) => {
        this.salesToday = salesToday;
        this.calculateSummary(products, salesToday);
        this.calculateProductStatsFromReports(salesToday, products);
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private calculateSummary(products: Product[], salesToday: SalesTodayResponse) {
    this.summary = {
      activeProducts: products.filter(p => p.isActive).length,
      totalProducts: products.length,
      totalSalesToday: salesToday.summary.totalItems,
      totalRevenueToday: salesToday.summary.totalValue
    };
  }

  private calculateProductStatsFromReports(salesToday: SalesTodayResponse, products: Product[]) {
    const salesMap = new Map<string, any>();
    salesToday.products.forEach(productSales => {
      salesMap.set(productSales.productId, productSales);
    });

    this.productStats = products.map(product => {
      const sales = salesMap.get(product.id);
      return {
        productId: product.id,
        productName: product.name,
        totalSold: sales?.totalQuantity || 0,
        totalRevenue: sales?.totalValue || 0,
        category: product.category,
        isActive: product.isActive
      };
    }).sort((a, b) => b.totalSold - a.totalSold);
  }

  private getDateFromTimestamp(timestamp: any): Date {
    if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  }

  formatDate(dateString: string | any): string {
    if (dateString && typeof dateString === 'object' && dateString._seconds) {
      const date = new Date(dateString._seconds * 1000);
      return date.toLocaleDateString('pt-BR');
    }
    if (typeof dateString === 'string') {
      return new Date(dateString).toLocaleDateString('pt-BR');
    }
    return 'Data inválida';
  }
}