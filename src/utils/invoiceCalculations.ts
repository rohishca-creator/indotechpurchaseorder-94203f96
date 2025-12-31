import { InvoiceData, CalculatedValues } from "@/types/invoice";

export const calculateInvoice = (data: InvoiceData): CalculatedValues => {
  const totalAmount = data.quantity * data.rate;
  return { totalAmount };
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
