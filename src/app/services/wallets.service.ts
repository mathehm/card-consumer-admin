import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  name: string;
  phone: string;
}

export interface Product {
  price: number;
  productName: string;
  category: string;
  id: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  value: number;
  type: 'credit' | 'debit' | 'transfer';
  date: string;
  hasProducts: boolean;
  itemsCount: number;
  products?: Product[]
  description?: string;
  cancellationReason?: string;
}

export interface Wallet {
  id?: string;
  code: number;
  balance: number;
  user: User;
  transactions?: Transaction[];
  totalCredit?: number;
  alreadyWinner?: boolean;
  createdAt?: string | FirebaseTimestamp;
  updatedAt?: string | FirebaseTimestamp;
}

export interface CreateWalletRequest {
  code: number;
  balance?: number;
  user: User;
}

export interface AddCreditRequest {
  value: number;
}

export interface DebitRequest {
  items?: Array<{
    productId: string;
    quantity: number;
  }>;
  value?: number;
}

export interface TransferRequest {
  toCode: number;
  value: number;
}

export interface CancelTransactionRequest {
  transactionId: string;
}

export interface LotteryDrawRequest {
  valorPorEntrada: number;
}

export interface WalletListResponse {
  data: Wallet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    sortBy?: string;
    status?: string;
  };
  fromCache: boolean;
}

export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Listar carteiras com paginação e filtros
  getWallets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    status?: string
  ): Observable<WalletListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (status) params = params.set('status', status);

    return this.http.get<WalletListResponse>(`${this.apiUrl}/wallet`, { params });
  }

  // Registrar nova carteira
  registerWallet(wallet: CreateWalletRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/wallet/register`, wallet);
  }

  // Obter informações da carteira pelo código
  getWallet(code: number): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/wallet/${code}`);
  }

  // Adicionar crédito na carteira
  addCredit(code: number, request: AddCreditRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/wallet/${code}/credit`, request);
  }

  // Realizar débito na carteira
  debitWallet(code: number, request: DebitRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wallet/${code}/debit`, request);
  }

  // Transferir saldo entre carteiras
  transferFunds(code: number, request: TransferRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/wallet/${code}/transfer`, request);
  }

  // Cancelar transação
  cancelTransaction(code: number, request: CancelTransactionRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/wallet/${code}/cancel-transaction`, request);
  }

  // Remover carteira
  deleteWallet(code: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/wallet/${code}`);
  }

  // Realizar sorteio da loteria
  drawLottery(request: LotteryDrawRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wallet/lottery/draw`, request);
  }

  // Marcar carteira como vencedora
  markWinner(code: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wallet/${code}/mark-winner`, {});
  }
}
