import jsPDF from "jspdf";
import { InvoiceData, CalculatedValues } from "@/types/invoice";
import { formatCurrency, formatDate } from "./invoiceCalculations";

// Fetch image as binary and convert to base64 WITHOUT canvas re-encoding
const fetchImageAsBase64 = async (imagePath: string): Promise<string | null> => {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Simple base64 helper for signature (uses canvas for webp compatibility)
const getImageBase64 = async (imagePath: string): Promise<string> => {
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
    img.src = imagePath;
  });
};

export const generatePDF = async (
  data: InvoiceData,
  calculations: CalculatedValues
): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Brand Colors - Indotech Metals (only these + black/white)
  const brandCopper = [201, 124, 60] as const;  // #C97C3C - copper/orange
  const brandBrown = [74, 44, 26] as const;     // #4A2C1A - dark brown
  const black = [30, 30, 30] as const;          // near black for body text

  // Pure white background (no colored header bar)
  // Logo centered at top - using binary fetch for original quality
  let logoBottomY = 36; // Default if logo fails to load
  try {
    const logoBase64 = await fetchImageAsBase64("/images/logo-hq.png");
    if (logoBase64) {
      // Get image properties from jsPDF for accurate dimensions
      const props = doc.getImageProperties(logoBase64);
      // Logo width ~55mm (about 26% of A4 width), height calculated from actual aspect ratio
      const logoWidth = 55;
      const logoHeight = logoWidth * (props.height / props.width); // Maintain true aspect ratio
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = 15; // 15mm top margin
      doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
      logoBottomY = logoY + logoHeight; // Track where logo ends
    }
  } catch (e) {
    console.log("Logo could not be loaded");
  }

  // Company name - centered under logo (6mm gap from logo bottom)
  const companyNameY = logoBottomY + 6;
  doc.setTextColor(...brandBrown);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INDOTECH METALS PRIVATE LIMITED", pageWidth / 2, companyNameY, { align: "center" });
  
  // Tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text("Manufacturers of Copper Wire Rod, Copper Strip & PVC Insulated Cables", pageWidth / 2, companyNameY + 6, { align: "center" });

  // Company address - centered
  doc.setFontSize(8);
  doc.text("Transport Nagar Road, Sector-17/A, Ambey Majra, Mandi Gobindgarh, Distt-Fatehgarh Sahib, Punjab (147301), India", pageWidth / 2, companyNameY + 12, { align: "center" });

  // Registration & Contact details - centered
  doc.setFontSize(7);
  doc.text("CIN: U24109PB2024PTC061421 | GSTIN: 03AAHCI6485M1Z3 | PAN & IEC: AAHCI6485M", pageWidth / 2, companyNameY + 18, { align: "center" });
  doc.text("Phone: 98141-10981 | 99076-00034 | Email: Dinesh@indotechmetals.com | www.indotechmetals.com", pageWidth / 2, companyNameY + 23, { align: "center" });

  // Copper accent line under header
  doc.setDrawColor(...brandCopper);
  doc.setLineWidth(0.8);
  doc.line(14, companyNameY + 28, pageWidth - 14, companyNameY + 28);

  // Order Confirmation title - dark brown, no background
  doc.setTextColor(...brandBrown);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER CONFIRMATION", pageWidth / 2, companyNameY + 38, { align: "center" });

  // Date
  const infoStartY = companyNameY + 47;
  doc.setTextColor(...black);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 14, infoStartY);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(data.invoiceDate), 32, infoStartY);

  // Bill To section - no background, just clean text
  const billToY = infoStartY + 12;
  
  doc.setTextColor(...brandBrown);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TO:", 14, billToY);

  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.text(data.partyName || "—", 14, billToY + 8);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (data.partyAddress) doc.text(data.partyAddress, 14, billToY + 14);
  if (data.partyPhone) doc.text(`Phone: ${data.partyPhone}`, 14, billToY + 20);
  if (data.partyEmail) doc.text(`Email: ${data.partyEmail}`, 90, billToY + 20);
  if (data.brokerName) {
    doc.setTextColor(...brandCopper);
    doc.text(`Broker: ${data.brokerName}`, 14, billToY + 26);
    doc.setTextColor(...black);
  }

  // Items table with copper borders
  const tableY = billToY + 38;
  const tableWidth = pageWidth - 28;
  const colWidths = [70, 30, 25, 40]; // Description, Qty, Coils, Rate
  const colX = [14, 84, 114, 139];
  
  // Table header - white background with copper border
  doc.setDrawColor(...brandCopper);
  doc.setLineWidth(0.5);
  doc.rect(14, tableY, tableWidth, 10);
  
  doc.setTextColor(...brandBrown);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", 18, tableY + 7);
  doc.text("QTY (KG)", 88, tableY + 7);
  doc.text("COILS", 118, tableY + 7);
  doc.text("RATE (Rs/KG)", 143, tableY + 7);

  // Table row - white with copper border
  const rowY = tableY + 10;
  doc.rect(14, rowY, tableWidth, 12);

  doc.setTextColor(...black);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Copper Wire Rod", 18, rowY + 8);
  doc.text(data.quantity.toLocaleString("en-IN"), 88, rowY + 8);
  doc.text(data.numberOfCoils.toString(), 118, rowY + 8);
  doc.text(formatCurrency(data.rate).replace("₹", ""), 143, rowY + 8);

  // Vertical lines for table columns
  doc.line(84, tableY, 84, rowY + 12);
  doc.line(114, tableY, 114, rowY + 12);
  doc.line(139, tableY, 139, rowY + 12);

  // Payment terms & Station
  const termsY = rowY + 28;
  doc.setTextColor(...black);
  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandBrown);
  doc.text("Payment Terms:", 14, termsY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text(data.paymentTerms || "—", 55, termsY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandBrown);
  doc.text("Delivery Station:", 14, termsY + 10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text(data.station || "—", 55, termsY + 10);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandBrown);
  doc.text("Delivery Date:", 14, termsY + 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...black);
  doc.text(data.deliveryDate ? formatDate(data.deliveryDate) : "—", 55, termsY + 20);

  // Notes section
  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandBrown);
    doc.text("Notes:", 14, termsY + 35);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(splitNotes, 14, termsY + 43);
  }

  // Footer
  const footerY = 270;
  doc.setDrawColor(...brandCopper);
  doc.setLineWidth(0.5);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setTextColor(...black);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", pageWidth / 2, footerY + 8, { align: "center" });

  // Digital Signature area - Dinesh Mehta, Managing Director
  try {
    const signatureBase64 = await getImageBase64("/images/signature.webp");
    if (signatureBase64) {
      doc.addImage(signatureBase64, "WEBP", pageWidth - 65, footerY - 45, 50, 30);
    }
  } catch (e) {
    console.log("Signature could not be loaded");
  }
  
  doc.setTextColor(...brandBrown);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("For INDOTECH METALS PVT. LTD.", pageWidth - 40, footerY - 8, { align: "center" });

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
