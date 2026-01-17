import { useState } from "react";
import { Calendar, FileText, Download, Printer, User, Phone, Mail, MapPin, Package, Coins, CreditCard, Share2, RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/types/invoice";
import { calculateInvoice, formatCurrency, formatDate } from "@/utils/invoiceCalculations";
import { downloadPDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import { useCreateOrder } from "@/hooks/useOrders";

const paymentTermsOptions = [
  "5 Days",
  "7 Days",
  "Same Day RTGS",
  "Next Day RTGS",
  "Advance Payment",
];

const itemDescriptionOptions = [
  "Copper Wire Rod 8 mm",
  "Copper Wire Rod 12 mm",
];

const quantityOptions = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
  11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
];

const coilsOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const InvoiceForm = () => {
  const createOrder = useCreateOrder();
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceDate: new Date(),
    deliveryDate: null,
    partyName: "",
    partyAddress: "",
    partyPhone: "",
    partyEmail: "",
    brokerName: "",
    itemDescription: "Copper Wire Rod 8 mm",
    quantity: 0,
    numberOfCoils: 0,
    rate: 0,
    paymentTerms: "5 Days",
    station: "",
    notes: "",
  });

  const calculations = calculateInvoice(formData);

  const handleInputChange = (field: keyof InvoiceData, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.partyName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the party/customer name",
        variant: "destructive",
      });
      return false;
    }
    if (formData.quantity <= 0 || formData.rate <= 0) {
      toast({
        title: "Missing Information",
        description: "Please enter valid quantity and rate",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDownloadPDF = async () => {
    if (!validateForm()) return;
    await downloadPDF(formData, calculations);
    toast({
      title: "PDF Generated!",
      description: "Quotation downloaded successfully",
    });
  };

  const handleWhatsAppShare = () => {
    if (!validateForm()) return;
    
    // Create message text
    const message = `*${formData.itemDescription} Quotation*

📅 Date: ${formatDate(formData.invoiceDate)}
${formData.deliveryDate ? `📦 Delivery Date: ${formatDate(formData.deliveryDate)}` : ""}

👤 *Party:* ${formData.partyName}
${formData.partyAddress ? `📍 ${formData.partyAddress}` : ""}${formData.brokerName ? `
🤝 Broker: ${formData.brokerName}` : ""}

📦 *Order Details:*
• Item: ${formData.itemDescription}
• Quantity: ${formData.quantity.toLocaleString("en-IN")} kg
• Coils: ${formData.numberOfCoils}
• Rate: ${formatCurrency(formData.rate)}/kg

📋 Payment Terms: ${formData.paymentTerms}
🚚 Station: ${formData.station || "TBD"}

💡 *GST 18% Extra*${formData.notes ? `

📝 Notes: ${formData.notes}` : ""}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "Opening WhatsApp",
      description: "Share the quotation with your contacts",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewQuotation = () => {
    setFormData({
      ...formData,
      invoiceDate: new Date(),
      deliveryDate: null,
      partyName: "",
      partyAddress: "",
      partyPhone: "",
      partyEmail: "",
      brokerName: "",
      itemDescription: "Copper Wire Rod 8 mm",
      quantity: 0,
      numberOfCoils: 0,
      rate: 0,
      station: "",
      notes: "",
    });
    toast({
      title: "New Quotation",
      description: "Form cleared for new quotation",
    });
  };

  const handleSaveOrder = async () => {
    if (!validateForm()) return;
    if (!formData.station.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the delivery station for dispatch tracking",
        variant: "destructive",
      });
      return;
    }
    await createOrder.mutateAsync(formData);
  };

  return (
    <div className="bg-background">
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Date & New Button */}
        <div className="bg-card rounded-xl shadow-card p-4 mb-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
            <Button variant="ghost" size="sm" onClick={handleNewQuotation}>
              <FileText className="w-4 h-4 mr-1" />
              New Quotation
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
              <div>
                <label className="label-text">Item Description *</label>
                <select
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {itemDescriptionOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Quantity (kg) *</label>
                  <select
                    value={formData.quantity || ""}
                    onChange={(e) => handleInputChange("quantity", parseFloat(e.target.value) || 0)}
                    className="input-field font-mono cursor-pointer"
                  >
                    <option value="">Select quantity</option>
                    {quantityOptions.map((qty) => (
                      <option key={qty} value={qty}>
                        {qty.toLocaleString("en-IN")} kg
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Number of Coils</label>
                  <select
                    value={formData.numberOfCoils || ""}
                    onChange={(e) => handleInputChange("numberOfCoils", parseInt(e.target.value) || 0)}
                    className="input-field font-mono cursor-pointer"
                  >
                    <option value="">Select coils</option>
                    {coilsOptions.map((coil) => (
                      <option key={coil} value={coil}>
                        {coil}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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

              <div>
                <label className="label-text flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate ? formData.deliveryDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => handleInputChange("deliveryDate", e.target.value ? new Date(e.target.value) : null)}
                  className="input-field cursor-pointer"
                />
              </div>

              <div>
                <label className="label-text flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Broker Name
                </label>
                <input
                  type="text"
                  placeholder="Enter broker name (if any)"
                  value={formData.brokerName}
                  onChange={(e) => handleInputChange("brokerName", e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </label>
                <textarea
                  placeholder="Add any additional notes or remarks"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="input-field min-h-[60px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Quotation Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-mono font-medium text-foreground">
                  {formData.quantity.toLocaleString("en-IN")} kg
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(formData.rate)}/kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 no-print">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={handleSaveOrder}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Order
          </Button>
          <Button
            variant="copper"
            size="lg"
            className="flex-1"
            onClick={handleWhatsAppShare}
          >
            <Share2 className="w-5 h-5" />
            Share on WhatsApp
          </Button>
          <Button
            variant="default"
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
            className="flex-1 sm:flex-none"
            onClick={handlePrint}
          >
            <Printer className="w-5 h-5" />
            Print
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={handleNewQuotation}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InvoiceForm;
