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
import { WalletsService, Wallet } from '../../services/wallets.service';
import { ProductsService, Product } from '../../services/products.service';
import { ReportsService, SalesTodayResponse, ProductSales } from '../../services/reports.service';

interface DashboardSummary {
  totalWallets: number;
  totalBalance: number;
  totalCredit: number;
  activeProducts: number;
  totalProducts: number;
  eligibleForLottery: number;
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
    totalWallets: 0,
    totalBalance: 0,
    totalCredit: 0,
    activeProducts: 0,
    totalProducts: 0,
    eligibleForLottery: 0
  };
  
  productStats: ProductStats[] = [];
  recentWallets: Wallet[] = [];
  salesToday: SalesTodayResponse | null = null;

  constructor(
    private walletsService: WalletsService,
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
      wallets: this.walletsService.getWallets(1, 1000),
      products: this.productsService.getProducts(),
      salesToday: this.reportsService.getSalesToday()
    }).subscribe({
      next: ({ wallets, products, salesToday }) => {
        this.salesToday = salesToday;
        this.calculateSummary(wallets.data, products, salesToday);
        this.calculateProductStatsFromReports(salesToday, products);
        this.recentWallets = wallets.data
          .sort((a, b) => {
            const dateA = this.getDateFromTimestamp(a.createdAt);
            const dateB = this.getDateFromTimestamp(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        
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

  private calculateSummary(wallets: Wallet[], products: Product[], salesToday: SalesTodayResponse) {
    this.summary = {
      totalWallets: wallets.length,
      totalBalance: wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
      totalCredit: wallets.reduce((sum, wallet) => sum + wallet.totalCredit, 0),
      activeProducts: products.filter(p => p.isActive).length,
      totalProducts: products.length,
      eligibleForLottery: wallets.filter(w => w.lotteryStatus === 'eligible').length
    };
  }

  private calculateProductStatsFromReports(salesToday: SalesTodayResponse, products: Product[]) {
    const productMap = new Map<string, Product>();
    products.forEach(product => {
      productMap.set(product.id, product);
    });

    this.productStats = salesToday.products.map(productSales => {
      const product = productMap.get(productSales.productId);
      return {
        productId: productSales.productId,
        productName: productSales.productName,
        totalSold: productSales.totalQuantity,
        totalRevenue: productSales.totalValue,
        category: product?.category,
        isActive: product?.isActive
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