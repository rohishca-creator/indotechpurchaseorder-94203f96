import { useState, useEffect } from "react";
import { Calendar, FileText, Download, Printer, Building2, User, Phone, Mail, MapPin, Package, Coins, Hash, Percent, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/types/invoice";
import { generateInvoiceNumber, calculateInvoice, formatCurrency, formatDate } from "@/utils/invoiceCalculations";
import { generatePDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";

const paymentTermsOptions = [
  "Cash on Delivery",
  "Net 7 Days",
  "Net 15 Days",
  "Net 30 Days",
  "Advance Payment",
  "50% Advance, 50% on Delivery",
];

const InvoiceForm = () => {
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    partyName: "",
    partyAddress: "",
    partyPhone: "",
    partyEmail: "",
    quantity: 0,
    numberOfCoils: 0,
    rate: 0,
    hsnCode: "7408",
    gstPercentage: 18,
    paymentTerms: "Net 30 Days",
    station: "",
  });

  const calculations = calculateInvoice(formData);

  const handleInputChange = (field: keyof InvoiceData, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPDF = () => {
    if (!formData.partyName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the party/customer name",
        variant: "destructive",
      });
      return;
    }
    if (formData.quantity <= 0 || formData.rate <= 0) {
      toast({
        title: "Missing Information",
        description: "Please enter valid quantity and rate",
        variant: "destructive",
      });
      return;
    }
    generatePDF(formData, calculations);
    toast({
      title: "PDF Generated!",
      description: `Invoice downloaded as PDF successfully`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewInvoice = () => {
    setFormData({
      ...formData,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date(),
      partyName: "",
      partyAddress: "",
      partyPhone: "",
      partyEmail: "",
      quantity: 0,
      numberOfCoils: 0,
      rate: 0,
      station: "",
    });
    toast({
      title: "New Invoice",
      description: "Form cleared for new invoice",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="invoice-header text-primary-foreground py-6 px-4 no-print">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-copper flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Indotech Metals Pvt Ltd</h1>
              <p className="text-sm opacity-90">Premium Copper Wire Rod Manufacturers</p>
            </div>
          </div>
          <p className="text-sm opacity-75 mt-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Mandi Gobindgarh, Punjab, India
          </p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Invoice Details Bar */}
        <div className="bg-card rounded-xl shadow-card p-4 mb-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="label-text flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Invoice No
                </span>
                <p className="font-mono font-semibold text-foreground">{formData.invoiceNumber}</p>
              </div>
              <div>
                <span className="label-text flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </span>
                <input
                  type="date"
                  value={formData.invoiceDate.toISOString().split("T")[0]}
                  onChange={(e) => handleInputChange("invoiceDate", new Date(e.target.value))}
                  className="font-medium text-foreground bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleNewInvoice}>
              <FileText className="w-4 h-4 mr-1" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Details */}
          <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal" />
              Customer Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="label-text">Party Name *</label>
                <input
                  type="text"
                  placeholder="Enter customer/company name"
                  value={formData.partyName}
                  onChange={(e) => handleInputChange("partyName", e.target.value)}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="label-text">Address</label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.partyAddress}
                  onChange={(e) => handleInputChange("partyAddress", e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.partyPhone}
                    onChange={(e) => handleInputChange("partyPhone", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.partyEmail}
                    onChange={(e) => handleInputChange("partyEmail", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-copper" />
              Product Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Quantity (kg) *</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.quantity || ""}
                    onChange={(e) => handleInputChange("quantity", parseFloat(e.target.value) || 0)}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="label-text">Number of Coils</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.numberOfCoils || ""}
                    onChange={(e) => handleInputChange("numberOfCoils", parseInt(e.target.value) || 0)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> Rate (₹/kg) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.rate || ""}
                    onChange={(e) => handleInputChange("rate", parseFloat(e.target.value) || 0)}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="label-text">HSN Code</label>
                  <input
                    type="text"
                    placeholder="7408"
                    value={formData.hsnCode}
                    onChange={(e) => handleInputChange("hsnCode", e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label-text flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> GST Percentage
                </label>
                <select
                  value={formData.gstPercentage}
                  onChange={(e) => handleInputChange("gstPercentage", parseInt(e.target.value))}
                  className="input-field cursor-pointer"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal" />
              Payment & Delivery
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label-text">Payment Terms</label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {paymentTermsOptions.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Station
                </label>
                <input
                  type="text"
                  placeholder="Enter delivery location"
                  value={formData.station}
                  onChange={(e) => handleInputChange("station", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(calculations.subtotal)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">GST ({formData.gstPercentage}%)</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(calculations.gstAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 bg-gradient-to-r from-teal-dark to-teal rounded-lg px-4 -mx-1">
                <span className="text-primary-foreground font-semibold">Total Amount</span>
                <span className="font-mono font-bold text-xl text-primary-foreground">
                  {formatCurrency(calculations.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 no-print">
          <Button
            variant="copper"
            size="lg"
            className="flex-1"
            onClick={handleDownloadPDF}
          >
            <Download className="w-5 h-5" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            Print Invoice
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm mt-10 pb-6 no-print">
          <p>© {new Date().getFullYear()} Indotech Metals Pvt Ltd. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default InvoiceForm;
