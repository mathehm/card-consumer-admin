import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { forkJoin } from 'rxjs';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { ProductsService, Product } from '../../services/products.service';
import { ReportsService, PartySummaryResponse } from '../../services/reports.service';

interface DashboardSummary {
  activeProducts: number;
  totalProducts: number;
  totalSalesToday: number;
  totalRevenueToday: number;
  totalWalletCredit: number;
  totalSales: number;
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
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzDividerModule
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
    totalRevenueToday: 0,
    totalWalletCredit: 0,
    totalSales: 0
  };
  
  productStats: ProductStats[] = [];
  rankingType: 'quantity' | 'revenue' = 'quantity';
  dateRange: [Date, Date] | null = null;

  constructor(
    private productsService: ProductsService,
    private reportsService: ReportsService,
    private cdr: ChangeDetectorRef,
    private exportAsService: ExportAsService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.cdr.markForCheck();

    const productsRequest = this.productsService.getProducts();
    
    // Sempre usa party summary, se não há range de datas, usa data de hoje
    const today = new Date();
    const startDate = this.dateRange && this.dateRange[0] 
      ? this.formatDateToString(this.dateRange[0])
      : this.formatDateToString(today);
    const endDate = this.dateRange && this.dateRange[1]
      ? this.formatDateToString(this.dateRange[1])
      : this.formatDateToString(today);

    const reportsRequest = this.reportsService.getPartySummary(startDate, endDate);

    forkJoin({
      products: productsRequest,
      reports: reportsRequest
    }).subscribe({
      next: ({ products, reports }) => {
        this.calculateSummaryFromPartySummary(products, reports);
        this.calculateProductStatsFromPartySummary(reports, products);
        
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


  sortProductStats() {
    if (this.rankingType === 'quantity') {
      this.productStats.sort((a, b) => b.totalSold - a.totalSold);
    } else {
      this.productStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
    this.cdr.markForCheck();
  }

  changeRankingType(type: 'quantity' | 'revenue') {
    this.rankingType = type;
    this.sortProductStats();
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

  // Métodos para lidar com date range
  onDateRangeChange() {
    this.loadDashboardData();
  }

  clearDateRange() {
    this.dateRange = null;
    this.loadDashboardData();
  }

  private formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  exportToExcel() {
    const exportConfig: ExportAsConfig = {
      type: 'xlsx',
      elementIdOrContent: 'productTable',
      options: {
        jsPDF: {
          orientation: 'landscape'
        },
        pdfCallbackFn: (pdf: any) => {
          // callback function
        }
      }
    };

    const fileName = this.getExportFileName('excel');
    this.exportAsService.save(exportConfig, fileName).subscribe(() => {
      console.log('Exportação para Excel concluída!');
    });
  }

  exportToCSV() {
    const exportConfig: ExportAsConfig = {
      type: 'csv',
      elementIdOrContent: 'productTable'
    };

    const fileName = this.getExportFileName('csv');
    this.exportAsService.save(exportConfig, fileName).subscribe(() => {
      console.log('Exportação para CSV concluída!');
    });
  }

  private getExportFileName(format: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    let periodStr = '';
    if (this.dateRange) {
      const startDate = this.dateRange[0].toLocaleDateString('pt-BR');
      const endDate = this.dateRange[1].toLocaleDateString('pt-BR');
      periodStr = `_${startDate}_a_${endDate}`;
    } else {
      periodStr = `_${now.toLocaleDateString('pt-BR')}`;
    }
    
    return `ranking-produtos${periodStr}_${dateStr}_${timeStr}`;
  }


  private calculateSummaryFromPartySummary(products: Product[], partySummary: PartySummaryResponse) {
    this.summary = {
      activeProducts: products.filter(p => p.isActive).length,
      totalProducts: products.length,
      totalSalesToday: partySummary.totalSalesQuantity,
      totalRevenueToday: partySummary.totalSalesValue,
      totalWalletCredit: partySummary.totalWalletCredit,
      totalSales: partySummary.totalSales
    };
  }

  private calculateProductStatsFromPartySummary(partySummary: PartySummaryResponse, products: Product[]) {
    // Criar um mapa dos produtos por ID para referência rápida
    const productsMap = new Map<string, Product>();
    products.forEach(product => {
      productsMap.set(product.id, product);
    });

    // Converter productBreakdown para ProductStats
    this.productStats = partySummary.productBreakdown.map(breakdown => {
      const product = productsMap.get(breakdown.productId);
      return {
        productId: breakdown.productId,
        productName: breakdown.productName,
        totalSold: breakdown.totalQuantity,
        totalRevenue: breakdown.totalValue,
        category: product?.category || 'N/A',
        isActive: product?.isActive
      };
    });

    // Adicionar produtos que não tiveram vendas
    products.forEach(product => {
      if (!partySummary.productBreakdown.find(b => b.productId === product.id)) {
        this.productStats.push({
          productId: product.id,
          productName: product.name,
          totalSold: 0,
          totalRevenue: 0,
          category: product.category,
          isActive: product.isActive
        });
      }
    });
    
    this.sortProductStats();
  }
}