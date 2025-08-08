import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { WalletsService, Wallet, CreateWalletRequest, AddCreditRequest, FirebaseTimestamp } from '../../services/wallets.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-wallets',
  imports: [
    CommonModule, 
    FormsModule,
    NzTableModule, 
    NzButtonModule, 
    NzIconModule, 
    NzEmptyModule, 
    NzPopoverModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzPaginationModule,
    NzSelectModule,
    NzTagModule,
    NzDrawerModule,
    NzSpinModule,
    NzToolTipModule
  ],
  templateUrl: './wallets.html',
  styleUrl: './wallets.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Wallets implements OnInit {
  wallets: Wallet[] = [];
  loading = false;
  total = 0;
  page = 1;
  limit = 10;
  search = '';
  sortBy = 'code_desc';
  status = '';

  // Modais
  isCreateModalVisible = false;
  isCreditModalVisible = false;
  isWalletDrawerVisible = false;
  
  // Estados
  currentWallet: Wallet | null = null;
  selectedWallet: Wallet | null = null;

  // Formulários
  walletForm: CreateWalletRequest = {
    code: 0,
    balance: 0,
    user: {
      name: '',
      phone: ''
    }
  };

  creditForm: AddCreditRequest = {
    value: 0
  };

  // Opções de ordenação
  sortOptions = [
    { value: 'createdAt_desc', label: 'Mais recentes' },
    { value: 'createdAt_asc', label: 'Mais antigos' },
    { value: 'balance_desc', label: 'Maior saldo' },
    { value: 'balance_asc', label: 'Menor saldo' },
    { value: 'totalCredit_desc', label: 'Maior crédito total' },
    { value: 'totalCredit_asc', label: 'Menor crédito total' },
    { value: 'userName_asc', label: 'Nome A-Z' },
    { value: 'userName_desc', label: 'Nome Z-A' },
    { value: 'code_asc', label: 'Código crescente' },
    { value: 'code_desc', label: 'Código decrescente' }
  ];

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'eligible', label: 'Elegíveis para sorteio' },
    { value: 'winner', label: 'Vencedores' },
    { value: 'ineligible', label: 'Inelegíveis' }
  ];

  constructor(
    private walletsService: WalletsService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.loading = true;
    this.cdr.markForCheck();

    this.walletsService.getWallets(this.page, this.limit, this.search, this.sortBy, this.status).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.wallets = response.data;
        this.total = response.pagination.total;
      },
      error: (error) => {
        console.error('Erro ao carregar carteiras:', error);
        this.message.error('Erro ao carregar carteiras');
      }
    });
  }

  reloadWallets(successMessage?: string) {
    this.loading = true;

    this.walletsService.getWallets(this.page, this.limit, this.search, this.sortBy, this.status).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.wallets = response.data;
        this.total = response.pagination.total;
        if (successMessage) {
            this.message.success(successMessage);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar carteiras:', error);
        this.message.error('Erro ao carregar carteiras');
      }
    });
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadWallets();
  }

  onPageSizeChange(size: number) {
    this.limit = size;
    this.page = 1;
    this.loadWallets();
  }

  onSearch() {
    this.page = 1;
    this.loadWallets();
  }

  onSortChange() {
    this.page = 1;
    this.loadWallets();
  }

  onStatusChange() {
    this.page = 1;
    this.loadWallets();
  }

  resetFilters() {
    this.search = '';
    this.sortBy = 'createdAt_desc';
    this.status = 'all';
    this.page = 1;
    this.loadWallets();
  }

  // Modal de criação
  openCreateModal() {
    this.walletForm = {
      code: 0,
      balance: 0,
      user: {
        name: '',
        phone: ''
      }
    };
    this.isCreateModalVisible = true;
  }

  createWallet() {
    this.walletsService.registerWallet(this.walletForm).subscribe({
      next: (response) => {
        this.isCreateModalVisible = false;
        this.reloadWallets('Carteira criada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao criar carteira:', error);
        this.message.error('Erro ao criar carteira');
      }
    });
  }

  // Modal de crédito
  openCreditModal(wallet: Wallet) {
    this.currentWallet = wallet;
    this.creditForm = { value: 0 };
    this.isCreditModalVisible = true;
  }

  addCredit() {
    if (!this.currentWallet) return;

    this.walletsService.addCredit(this.currentWallet.code, this.creditForm).subscribe({
      next: (response) => {
        this.isCreditModalVisible = false;
        this.reloadWallets('Crédito adicionado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao adicionar crédito:', error);
        this.message.error('Erro ao adicionar crédito');
      }
    });
  }

  addCreditWithReload() {
    if (!this.currentWallet) return;

    this.walletsService.addCredit(this.currentWallet.code, this.creditForm).subscribe({
      next: (response) => {
        this.isCreditModalVisible = false;
        this.reloadWallets('Crédito adicionado com sucesso!');
        
        // Buscar dados completos da carteira incluindo transações
        this.walletsService.getWallet(this.currentWallet!.code).pipe(
          finalize(() => {
            this.cdr.markForCheck();
          })
        ).subscribe({
          next: (fullWallet) => {
            this.selectedWallet = fullWallet;
          },
          error: (error) => {
            console.error('Erro ao carregar detalhes da carteira:', error);
            this.message.error('Erro ao carregar detalhes da carteira');
          }
        });
      },
      error: (error) => {
        console.error('Erro ao adicionar crédito:', error);
        this.message.error('Erro ao adicionar crédito');
      }
    });
  }

  // Drawer de detalhes
  openWalletDetails(wallet: Wallet) {
    this.selectedWallet = null;
    this.isWalletDrawerVisible = true;
    
    // Buscar dados completos da carteira incluindo transações
    this.walletsService.getWallet(wallet.code).pipe(
      finalize(() => {
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (fullWallet) => {
        this.selectedWallet = fullWallet;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes da carteira:', error);
        this.message.error('Erro ao carregar detalhes da carteira');
        this.selectedWallet = wallet; // Fallback para dados básicos
      }
    });
  }

  deleteWallet(code: number) {
    this.walletsService.deleteWallet(code).subscribe({
      next: () => {
        this.reloadWallets('Carteira excluída com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao deletar carteira:', error);
        this.message.error('Erro ao excluir carteira');
      }
    });
  }

  markAsWinner(code: number) {
    this.walletsService.markWinner(code).subscribe({
      next: () => {
        this.reloadWallets('Carteira marcada como vencedora!');
        // Se o drawer estiver aberto para esta carteira, recarregar os dados
        if (this.selectedWallet && this.selectedWallet.code === code) {
          this.openWalletDetails(this.selectedWallet);
        }
      },
      error: (error) => {
        console.error('Erro ao marcar como vencedora:', error);
        this.message.error('Erro ao marcar como vencedora');
      }
    });
  }

  cancelTransaction(walletCode: number, transactionId: string) {
    this.walletsService.cancelTransaction(walletCode, { transactionId }).subscribe({
      next: (response) => {
        this.message.success('Transação cancelada com sucesso!');
        // Recarregar os dados da carteira no drawer
        if (this.selectedWallet && this.selectedWallet.code === walletCode) {
          this.openWalletDetails(this.selectedWallet);
        }
        // Recarregar a lista de carteiras para atualizar saldos
        this.loadWallets();
      },
      error: (error) => {
        console.error('Erro ao cancelar transação:', error);
        if (error.error?.message) {
          this.message.error(error.error.message);
        } else {
          this.message.error('Erro ao cancelar transação');
        }
      }
    });
  }

  canCancelTransaction(transaction: any): boolean {
    // Deixar que o backend determine as regras de cancelamento
    // Por enquanto, permitir tentativa de cancelamento para todas as transações
    // O backend retornará erro se não for possível cancelar
    return true;
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

  formatPhone(phone: string): string {
    if (!phone) return '';
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Aplica a máscara (11) 99999-9999
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
    }
    return phone;
  }

  getStatusTag(wallet: Wallet): { color: string; text: string } {
    if (wallet.alreadyWinner) {
      return { color: 'gold', text: 'Vencedor' };
    }
    if (wallet.totalCredit > 0) {
      return { color: 'green', text: 'Elegível' };
    }
    return { color: 'red', text: 'Inelegível' };
  }

  // Métodos para formatação de transações
  trackTransaction(index: number, transaction: any): string {
    return transaction.id;
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'credit': return 'plus-circle';
      case 'debit': return 'minus-circle';
      case 'transfer': return 'swap';
      default: return 'transaction';
    }
  }

  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'credit': return 'Crédito';
      case 'debit': return 'Débito';
      case 'transfer': return 'Transferência';
      default: return 'Transação';
    }
  }

  getTransactionColor(type: string): string {
    switch (type) {
      case 'credit': return '#52c41a';
      case 'debit': return '#ff4d4f';
      case 'transfer': return '#1890ff';
      default: return '#666';
    }
  }

  getTransactionPrefix(type: string): string {
    switch (type) {
      case 'credit': return '+';
      case 'debit': return '-';
      case 'transfer': return '±';
      default: return '';
    }
  }

  getWalletDrawerTitle(): string {
    if (this.selectedWallet?.user?.name) {
      return `Detalhes da Carteira - ${this.selectedWallet.user.name}`;
    }
    return 'Detalhes da Carteira';
  }

}
