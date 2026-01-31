import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/app/context/StoreContext';
import QRCode from 'qrcode';

interface InvoiceOptions {
  order: Order;
  language: 'bn' | 'en';
  type: 'customer' | 'admin'; // Customer PDF or Admin Print Slip
}

export const generateInvoice = async ({ order, type }: Omit<InvoiceOptions, 'language'>) => {
  const doc = new jsPDF();

  // Store Info
  const storeName = 'RizQara Shop';
  const storeAddress = 'Dhaka, Bangladesh';
  const storePhone = '+8801343042761';
  const storeEmail = 'rizqarashop@gmail.com';

  // Branding Color (Pink - #D91976)
  const primaryColor = [217, 25, 118];

  // Translation Map - Reverting to English Labels to fix encoding issues in PDF
  // Note: Values (Name, Address) will render in original script, but titles work best in ASCII
  const labels = {
    invoiceNo: 'Invoice No:',
    date: 'Date:',
    orderId: 'Order ID:',
    payment: 'Payment:',
    tracking: 'Tracking Code:',
    trxId: 'Transaction ID:',
    status: 'Status:',
    customerDetails: 'CUSTOMER DETAILS',
    name: 'Name:',
    phone: 'Phone:',
    address: 'Delivery Address:',
    subtotal: 'Subtotal:',
    discount: 'Discount:',
    deliveryFee: 'Delivery Fee:',
    grandTotal: 'GRAND TOTAL:',
    item: 'Item',
    variant: 'Variant',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    invoiceTitle: type === 'admin' ? 'PACKING SLIP' : 'INVOICE',
    footer: '* Returns accepted within 7 days (conditions apply). Thank you for shopping with us!'
  };

  let yPos = 15;

  // Header - Store Info
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(storeName, 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(storeAddress, 105, yPos, { align: 'center' });

  yPos += 5;
  doc.text(`${storePhone} | ${storeEmail}`, 105, yPos, { align: 'center' });

  yPos += 12;

  // Invoice Title - Removed Proforma status
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.invoiceTitle, 105, yPos, { align: 'center' });

  yPos += 12;

  // Invoice Details (2 columns)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Left Column
  const leftColX = 15;
  doc.setFont('helvetica', 'bold');
  doc.text(labels.invoiceNo, leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(order.invoiceNo, leftColX + 35, yPos);

  // Right Column
  const rightColX = 115;
  doc.setFont('helvetica', 'bold');
  doc.text(labels.date, rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(order.date).toLocaleDateString(), rightColX + 25, yPos);

  yPos += 7;

  // Order ID
  doc.setFont('helvetica', 'bold');
  doc.text(labels.orderId, leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(order.id.substring(0, 10), leftColX + 35, yPos);

  // Payment Method
  doc.setFont('helvetica', 'bold');
  doc.text(labels.payment, rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(order.paymentMethod.toUpperCase(), rightColX + 25, yPos);

  yPos += 7;

  // Tracking Code (if available)
  if (order.trackingCode) {
    doc.setFont('helvetica', 'bold');
    doc.text(labels.tracking, leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.trackingCode, leftColX + 35, yPos);
    yPos += 7;
  }

  // Payment Trx ID (if available)
  if (order.paymentTrxId) {
    doc.setFont('helvetica', 'bold');
    doc.text(labels.trxId, leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.paymentTrxId, leftColX + 35, yPos);

    // Payment Status
    doc.setFont('helvetica', 'bold');
    doc.text(labels.status, rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    const statusText = order.paymentStatus === 'verified' ? 'Verified' : 'Pending';
    doc.text(statusText, rightColX + 25, yPos);

    yPos += 7;
  }

  yPos += 5;

  // Customer Details Box
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(255, 248, 250); // Very light pink background
  doc.rect(15, yPos, 180, 32, 'FD');

  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(labels.customerDetails, 20, yPos);

  yPos += 7;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${labels.name} ${order.userName}`, 20, yPos);

  yPos += 6;
  doc.text(`${labels.phone} ${order.userPhone}`, 20, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(labels.address, 20, yPos);
  doc.setFont('helvetica', 'normal');
  const addressX = 20 + doc.getTextWidth(labels.address) + 2;
  const addressText = `${order.shippingAddress.details}, ${order.shippingAddress.upazila}, ${order.shippingAddress.district}, ${order.shippingAddress.division}`;
  const splitAddress = doc.splitTextToSize(addressText, 170 - doc.getTextWidth(labels.address));
  doc.text(splitAddress, addressX, yPos);

  yPos += Math.max(7, 6 * splitAddress.length) + 10;

  // Items Table
  const tableData = order.items.map(item => [
    item.title_en,
    item.selectedVariant || '-',
    item.quantity.toString(),
    `BDT ${(item.discount_price || item.price).toLocaleString()}`,
    `BDT ${((item.discount_price || item.price) * item.quantity).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [[labels.item, labels.variant, labels.qty, labels.price, labels.total]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]], textColor: 255, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 10, textColor: 50 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });

  // Get final Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Totals Section (Right aligned)
  const totalsX = 135;
  doc.setFontSize(10);

  // Calculate original total (sum of original prices)
  const originalTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Calculate discounted subtotal (sum of discount_price or price)
  const discountedSubtotal = order.items.reduce((sum, item) => sum + ((item.discount_price || item.price) * item.quantity), 0);
  // Product discount = difference between original and discounted
  const productDiscount = originalTotal - discountedSubtotal;

  // Voucher discount - use stored value OR calculate from the difference
  // For legacy orders: if (subtotal + delivery - total) > 0, that's the voucher
  let voucherDiscount = order.voucherDiscount || 0;
  if (voucherDiscount === 0) {
    const expectedTotal = discountedSubtotal + order.deliveryFee;
    const actualVoucherDiscount = expectedTotal - order.total;
    if (actualVoucherDiscount > 0) {
      voucherDiscount = actualVoucherDiscount;
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  // Show original subtotal (before any discounts)
  doc.text('Original Price:', totalsX, yPos);
  if (productDiscount > 0) {
    // Strike through if there's a product discount
    doc.setTextColor(150, 150, 150);
    const priceText = `BDT ${originalTotal.toLocaleString()}`;
    const priceX = 195 - doc.getTextWidth(priceText);
    doc.text(priceText, 195, yPos, { align: 'right' });
    // Strikethrough line
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(priceX, yPos - 1.5, 195, yPos - 1.5);
    doc.setTextColor(80, 80, 80);
    yPos += 6;
  } else {
    doc.text(`BDT ${originalTotal.toLocaleString()}`, 195, yPos, { align: 'right' });
    yPos += 6;
  }

  // Product Discount (if any)
  if (productDiscount > 0) {
    doc.setTextColor(34, 139, 34); // Green for savings
    doc.text('Product Discount:', totalsX, yPos);
    doc.text(`-BDT ${productDiscount.toLocaleString()}`, 195, yPos, { align: 'right' });
    doc.setTextColor(80, 80, 80);
    yPos += 6;
  }

  // Subtotal after product discount
  doc.text(labels.subtotal, totalsX, yPos);
  doc.text(`BDT ${discountedSubtotal.toLocaleString()}`, 195, yPos, { align: 'right' });
  yPos += 6;

  // Voucher Discount (if applied)
  if (voucherDiscount > 0) {
    doc.setTextColor(217, 25, 118); // Pink for voucher savings
    const voucherLabel = order.voucherCode ? `Voucher (${order.voucherCode}):` : 'Voucher Discount:';
    doc.text(voucherLabel, totalsX, yPos);
    doc.text(`-BDT ${voucherDiscount.toLocaleString()}`, 195, yPos, { align: 'right' });
    doc.setTextColor(80, 80, 80);
    yPos += 6;
  }

  // Delivery Fee
  doc.text(labels.deliveryFee, totalsX, yPos);
  doc.text(`BDT ${order.deliveryFee.toLocaleString()}`, 195, yPos, { align: 'right' });

  yPos += 10;

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  // Thick pink line for Grand Total
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, yPos - 6, 195, yPos - 6);

  doc.text(labels.grandTotal, totalsX, yPos);
  doc.text(`BDT ${order.total.toLocaleString()}`, 195, yPos, { align: 'right' });

  yPos += 15;

  // Footer - Return Policy & Notes
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  const policyLines = doc.splitTextToSize(labels.footer, 180);
  doc.text(policyLines, 105, yPos, { align: 'center' });

  if (type === 'admin') {
    yPos += 15;
    // For admin print slip, add ID info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ORDER SYSTEM ID:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.id, 45, yPos);
  }

  // QR Code Section - For customer invoices only
  if (type === 'customer') {
    yPos += 20;

    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL('https://rizqarashop.vercel.app/', {
        width: 200,
        margin: 1,
        color: {
          dark: '#D91976', // Pink QR code to match branding
          light: '#FFFFFF'
        }
      });

      // Decorative box around QR section
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(255, 252, 254); // Very light pink
      doc.roundedRect(57, yPos - 5, 96, 55, 3, 3, 'FD');

      // "Scan & Shop" header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('SCAN & SHOP', 105, yPos + 3, { align: 'center' });

      // QR code image
      doc.addImage(qrDataUrl, 'PNG', 85, yPos + 6, 30, 30);

    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  }

  // Save PDF
  const fileName = type === 'admin'
    ? `Packing_Slip_${order.invoiceNo}.pdf`
    : `Invoice_${order.invoiceNo}.pdf`;

  doc.save(fileName);
};

// Helper function to generate invoice for a specific order
export const downloadCustomerInvoice = async (order: Order) => {
  await generateInvoice({ order, type: 'customer' });
};

export const downloadAdminPackingSlip = async (order: Order) => {
  await generateInvoice({ order, type: 'admin' });
};