import jsPDF from "jspdf";
import { InvoiceData, CalculatedValues } from "@/types/invoice";
import { formatCurrency, formatDate } from "./invoiceCalculations";

// Convert image to base64 for PDF embedding
const getLogoBase64 = async (): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
    img.src = "/images/logo.png";
  });
};

export const generatePDF = async (
  data: InvoiceData,
  calculations: CalculatedValues
): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const tealDark = [26, 78, 78] as const;
  const copper = [191, 107, 51] as const;
  const gray = [100, 100, 100] as const;
  const black = [30, 40, 45] as const;

  // Header background
  doc.setFillColor(...tealDark);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Add logo
  try {
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 14, 8, 50, 18);
    }
  } catch (e) {
    console.log("Logo could not be loaded");
  }

  // Quotation title with copper accent
  doc.setFillColor(...copper);
  doc.rect(pageWidth - 70, 12, 56, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - 42, 21, { align: "center" });

  // Company address info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Sector 17 A, Transport Nagar Road, Ambey Majra, Mandi Gobindgarh, Punjab - 147301", 14, 32);
  doc.text("Phone: 98141-10981 | 99076-00034  |  Email: Dinesh@indotechmetals.com  |  www.indotechmetals.com", 14, 38);
  doc.setFontSize(7);
  doc.text("CIN: U24109PB2024PTC061421", 14, 44);

  // Date
  const infoStartY = 65;
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
  if (data.brokerName) {
    doc.setTextColor(...copper);
    doc.text(`Broker: ${data.brokerName}`, 18, billToY + 31);
    doc.setTextColor(...gray);
  }

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

  // Payment terms & Station
  const termsY = rowY + 35;
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

  doc.setFont("helvetica", "bold");
  doc.text("Delivery Date:", 14, termsY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(data.deliveryDate ? formatDate(data.deliveryDate) : "—", 55, termsY + 20);

  // Notes section
  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, termsY + 35);
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(splitNotes, 14, termsY + 43);
  }

  // Footer
  const footerY = 270;
  doc.setDrawColor(...tealDark);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", pageWidth / 2, footerY + 8, { align: "center" });

  // Signature area
  doc.setTextColor(...black);
  doc.setFontSize(9);
  doc.text("Authorized Signatory", pageWidth - 45, footerY - 15);
  doc.line(pageWidth - 70, footerY - 20, pageWidth - 20, footerY - 20);

  return doc;
};

export const downloadPDF = async (data: InvoiceData, calculations: CalculatedValues): Promise<void> => {
  const doc = await generatePDF(data, calculations);
  const fileName = `Quotation_${data.partyName.replace(/\s+/g, "_") || "Customer"}_${formatDate(data.invoiceDate).replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};

export const getPDFBlob = async (data: InvoiceData, calculations: CalculatedValues): Promise<Blob> => {
  const doc = await generatePDF(data, calculations);
  return doc.output("blob");
};
