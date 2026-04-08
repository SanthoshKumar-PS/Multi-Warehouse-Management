/*
  Warnings:

  - Made the column `warehouseName` on table `InventoryTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `InventoryTransaction` MODIFY `warehouseName` VARCHAR(191) NOT NULL;
