import express from 'express'
import { loginWarehouseTrigram, getInventoryStock, getInventoryProduct, getInventoryProductWithTransactions, postInventoryTransaction, getInventoryTransactions } from '../../modules/inventory/controller/inventory.controller'
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { authorizeWarehouse } from '../../middleware/authorizeWarehouseAccess'
import { createNewTransfer, dispatchTransferItems, getTransfers, getTransferByTransferNo } from '../../modules/transfer/controller/transfer.controller'
export const inventoryRouter = express.Router();

inventoryRouter.post('/loginWarehouse', loginWarehouseTrigram)

inventoryRouter.get('/stock', authenticate, authorize(['view_warehouse']), authorizeWarehouse(),  getInventoryStock)

inventoryRouter.get('/stock/product', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'),  getInventoryProduct)

inventoryRouter.get('/stock/inventoryProduct', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'),  getInventoryProductWithTransactions)

inventoryRouter.post('/stock/transaction', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'),  postInventoryTransaction)

inventoryRouter.get('/inventoryTransactions', authenticate, authorize(['view_warehouse']), authorizeWarehouse(),  getInventoryTransactions)



//Transfers
inventoryRouter.get('/transfers', authenticate, authorize(['view_warehouse']), authorizeWarehouse('VIEW'), getTransfers)

inventoryRouter.get('/transfers/:transferNo', authenticate, authorize(['view_warehouse']), authorizeWarehouse('VIEW'), getTransferByTransferNo)

inventoryRouter.patch('/transfers/:transferNo', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), dispatchTransferItems)

inventoryRouter.post('/transfers/new', authenticate, authorize(['manage_warehouse']), authorizeWarehouse('MANAGE'), createNewTransfer)
