import { ISaleRequestRepository, CreateSaleRequestDTO } from '../domain/saleRequest';

export class SaleRequestUseCase {
  constructor(private saleRequestRepository: ISaleRequestRepository) {}

  async getAllRequests() {
    return this.saleRequestRepository.findAll();
  }

  async getMyRequests(userId: string) {
    return this.saleRequestRepository.findByUserId(userId);
  }

  async createRequest(userId: string, requestData: CreateSaleRequestDTO) {
    return this.saleRequestRepository.create(userId, requestData);
  }
}
