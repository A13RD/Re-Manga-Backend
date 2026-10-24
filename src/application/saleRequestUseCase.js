"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleRequestUseCase = void 0;
class SaleRequestUseCase {
    saleRequestRepository;
    constructor(saleRequestRepository) {
        this.saleRequestRepository = saleRequestRepository;
    }
    async getAllRequests() {
        return this.saleRequestRepository.findAll();
    }
    async getMyRequests(userId) {
        return this.saleRequestRepository.findByUserId(userId);
    }
    async createRequest(userId, requestData) {
        return this.saleRequestRepository.create(userId, requestData);
    }
}
exports.SaleRequestUseCase = SaleRequestUseCase;
//# sourceMappingURL=saleRequestUseCase.js.map