import { InvoiceData, CalculatedValues } from "@/types/invoice";

export const calculateInvoice = (data: InvoiceData): CalculatedValues => {
  const subtotal = data.quantity * data.rate;
  const gstAmount = (subtotal * data.gstPercentage) / 100;
  const totalAmount = subtotal + gstAmount;

  return {
    subtotal,
    gstAmount,
    totalAmount,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `IM-${year}${month}-${random}`;
};
