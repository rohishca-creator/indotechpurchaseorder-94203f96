export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  partyName: string;
  partyAddress: string;
  partyPhone: string;
  partyEmail: string;
  quantity: number;
  numberOfCoils: number;
  rate: number;
  hsnCode: string;
  gstPercentage: number;
  paymentTerms: string;
  station: string;
}

export interface CalculatedValues {
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}
