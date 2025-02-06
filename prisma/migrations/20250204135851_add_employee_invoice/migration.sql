-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invoiceId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
