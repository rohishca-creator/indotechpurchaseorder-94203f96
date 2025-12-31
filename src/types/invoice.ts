export interface InvoiceData {
  invoiceDate: Date;
  deliveryDate: Date | null;
  partyName: string;
  partyAddress: string;
  partyPhone: string;
  partyEmail: string;
  quantity: number;
  numberOfCoils: number;
  rate: number;
  paymentTerms: string;
  station: string;
  notes: string;
}

export interface CalculatedValues {
  totalAmount: number;
}
