/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Fund` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Fund_name_key" ON "Fund"("name");
