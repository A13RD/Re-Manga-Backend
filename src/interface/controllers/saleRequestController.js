"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleRequestController = void 0;
class SaleRequestController {
    saleRequestUseCase;
    constructor(saleRequestUseCase) {
        this.saleRequestUseCase = saleRequestUseCase;
    }
    getAllRequests = async (req, res, next) => {
        try {
            const requests = await this.saleRequestUseCase.getAllRequests();
            res.json(requests);
        }
        catch (error) {
            next(error);
        }
    };
    getMyRequests = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const requests = await this.saleRequestUseCase.getMyRequests(userId);
            res.json(requests);
        }
        catch (error) {
            next(error);
        }
    };
    createRequest = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { title, author, genre, description, proposedPrice, condition } = req.body;
            if (!title || !author || !genre || !description || proposedPrice === undefined || !condition) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const newRequest = await this.saleRequestUseCase.createRequest(userId, req.body);
            res.status(201).json(newRequest);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.SaleRequestController = SaleRequestController;
//# sourceMappingURL=saleRequestController.js.map