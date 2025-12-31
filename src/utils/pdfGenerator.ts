import jsPDF from "jspdf";
import { InvoiceData, CalculatedValues } from "@/types/invoice";
import { formatCurrency, formatDate } from "./invoiceCalculations";

export const generatePDF = (
  data: InvoiceData,
  calculations: CalculatedValues
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const tealDark = [26, 78, 78] as const;
  const copper = [191, 107, 51] as const;
  const gray = [100, 100, 100] as const;
  const black = [30, 40, 45] as const;

  // Header background
  doc.setFillColor(...tealDark);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INDOTECH METALS PVT LTD", 14, 22);

  // Company tagline
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Copper Wire Rod Manufacturers", 14, 30);

  // Company address
  doc.setFontSize(9);
  doc.text("Mandi Gobindgarh, Punjab, India", 14, 38);

  // Quotation title with copper accent
  doc.setFillColor(...copper);
  doc.rect(pageWidth - 70, 12, 56, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - 42, 21, { align: "center" });

  // Date
  const infoStartY = 55;
  doc.setTextColor(...black);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 14, infoStartY);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(data.invoiceDate), 32, infoStartY);

  // Divider line
  doc.setDrawColor(...copper);
  doc.setLineWidth(0.5);
  doc.line(14, infoStartY + 5, pageWidth - 14, infoStartY + 5);

  // Bill To section
  const billToY = infoStartY + 15;
  doc.setFillColor(245, 245, 245);
  doc.rect(14, billToY - 5, pageWidth - 28, 35, "F");
  
  doc.setTextColor(...tealDark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TO:", 18, billToY + 3);

  doc.setTextColor(...black);
  doc.setFontSize(12);
  doc.text(data.partyName || "—", 18, billToY + 12);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  if (data.partyAddress) doc.text(data.partyAddress, 18, billToY + 19);
  if (data.partyPhone) doc.text(`Phone: ${data.partyPhone}`, 18, billToY + 25);
  if (data.partyEmail) doc.text(`Email: ${data.partyEmail}`, pageWidth / 2, billToY + 25);

  // Items table
  const tableY = billToY + 45;
  
  // Table header
  doc.setFillColor(...tealDark);
  doc.rect(14, tableY, pageWidth - 28, 10, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", 18, tableY + 7);
  doc.text("QTY (KG)", 90, tableY + 7);
  doc.text("COILS", 120, tableY + 7);
  doc.text("RATE (₹/KG)", 145, tableY + 7);
  doc.text("AMOUNT", pageWidth - 30, tableY + 7);

  // Table row
  const rowY = tableY + 10;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, rowY, pageWidth - 28, 12, "F");
  doc.setDrawColor(230, 230, 230);
  doc.line(14, rowY + 12, pageWidth - 14, rowY + 12);

  doc.setTextColor(...black);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Copper Wire Rod", 18, rowY + 8);
  doc.text(data.quantity.toLocaleString("en-IN"), 90, rowY + 8);
  doc.text(data.numberOfCoils.toString(), 120, rowY + 8);
  doc.text(formatCurrency(data.rate).replace("₹", ""), 145, rowY + 8);
  doc.text(formatCurrency(calculations.totalAmount).replace("₹", ""), pageWidth - 30, rowY + 8);

  // Total section
  const totalsY = rowY + 30;
  const totalsX = pageWidth - 80;
  
  // Grand Total
  doc.setFillColor(...copper);
  doc.rect(totalsX - 5, totalsY, pageWidth - totalsX + 5 - 14, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", totalsX, totalsY + 10);
  doc.text(formatCurrency(calculations.totalAmount), pageWidth - 20, totalsY + 10, { align: "right" });

  // Payment terms & Station
  const termsY = totalsY + 35;
  doc.setTextColor(...black);
  doc.setFontSize(10);
  
  doc.setFont("helvetica", "bold");
  doc.text("Payment Terms:", 14, termsY);
  doc.setFont("helvetica", "normal");
  doc.text(data.paymentTerms || "—", 55, termsY);

  doc.setFont("helvetica", "bold");
  doc.text("Delivery Station:", 14, termsY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(data.station || "—", 55, termsY + 10);

  // Footer
  const footerY = 270;
  doc.setDrawColor(...tealDark);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", pageWidth / 2, footerY + 8, { align: "center" });
  doc.text("Indotech Metals Pvt Ltd | Mandi Gobindgarh, Punjab", pageWidth / 2, footerY + 14, { align: "center" });

  // Signature area
  doc.setTextColor(...black);
  doc.setFontSize(9);
  doc.text("Authorized Signatory", pageWidth - 45, footerY - 15);
  doc.line(pageWidth - 70, footerY - 20, pageWidth - 20, footerY - 20);

  return doc;
};

export const downloadPDF = (data: InvoiceData, calculations: CalculatedValues): void => {
  const doc = generatePDF(data, calculations);
  const fileName = `Quotation_${data.partyName.replace(/\s+/g, "_") || "Customer"}_${formatDate(data.invoiceDate).replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};

export const getPDFBlob = (data: InvoiceData, calculations: CalculatedValues): Blob => {
  const doc = generatePDF(data, calculations);
  return doc.output("blob");
};
