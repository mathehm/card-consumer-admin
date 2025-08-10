import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sale {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
  soldAt: string;
}

export interface ProductSales {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalValue: number;
  sales: Array<{
    priceAtSale: number;
    quantity: number;
    subtotal: number;
    soldAt: string;
  }>;
}

export interface SalesTodayResponse {
  date: string;
  summary: {
    totalValue: number;
    totalItems: number;
    totalTransactions: number;
  };
  products: ProductSales[];
}

export interface SalesByProductResponse {
  productId: string;
  productName: string;
  sales: Sale[];
  summary: {
    totalQuantity: number;
    totalValue: number;
    salesCount: number;
  };
}

export interface SalesByPeriodResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalValue: number;
    totalQuantity: number;
    totalSales: number;
    daysWithSales: number;
  };
  salesByDate: Array<{
    date: string;
    totalValue: number;
    totalQuantity: number;
    sales: Sale[];
  }>;
}

export interface PartySummaryResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  totalWalletCredit: number;
  totalSalesValue: number;
  totalSalesQuantity: number;
  totalSales: number;
  productBreakdown: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalValue: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSalesToday(): Observable<SalesTodayResponse> {
    return this.http.get<SalesTodayResponse>(`${this.apiUrl}/reports/sales-today`);
  }

  getSalesByProduct(productId: string): Observable<SalesByProductResponse> {
    return this.http.get<SalesByProductResponse>(`${this.apiUrl}/reports/sales-by-product/${productId}`);
  }

  getSalesByPeriod(startDate: string, endDate: string): Observable<SalesByPeriodResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<SalesByPeriodResponse>(`${this.apiUrl}/reports/sales-by-period`, { params });
  }

  getPartySummary(startDate: string, endDate: string): Observable<PartySummaryResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<PartySummaryResponse>(`${this.apiUrl}/reports/party-summary`, { params });
  }
}