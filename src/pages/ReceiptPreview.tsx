import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Receipt } from '../types';
import { formatCurrency, numberToWords } from '../lib/utils';
import { Download, FileImage, Send, ArrowLeft, Edit } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getReceiptById } from '../lib/localDb';

export function ReceiptPreview() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fetchReceipt() {
      if (!id) return;
      try {
        const foundReceipt = getReceiptById(id);
        if (foundReceipt) {
          setReceipt(foundReceipt);
        }
      } catch (error) {
        console.error("Error fetching receipt", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [id]);

  if (loading) return <div className="p-4">Loading receipt...</div>;
  if (!receipt) return <div className="p-4">Receipt not found</div>;

  const getFilename = (ext: string) => {
    const name = receipt.customerName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    return `${receipt.receiptNumber}-${name}.${ext}`;
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(getFilename('pdf'));
  };

  const downloadJPG = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.download = getFilename('jpg');
    link.href = imgData;
    link.click();
  };

  const sendWhatsApp = async () => {
    const serviceList = receipt.services.map(s => `- ${s.name}: ${formatCurrency(s.amount)}`).join('\n');
    
    const message = `नमस्कार ${receipt.customerName} ज्यू,

Digital Solution बाट तपाईंको भुक्तानी प्राप्त भएको जानकारी गराउँछौँ।

सेवा:
${serviceList}

कुल रकम: ${formatCurrency(receipt.totalAmount)}
अक्षरमा: ${numberToWords(receipt.totalAmount)} Rupees Only
भुक्तानी माध्यम: ${receipt.paymentMethod}
रसिद नम्बर: ${receipt.receiptNumber}

धन्यवाद,
Digital Solution`;

    const encodedMessage = encodeURIComponent(message);
    let cleanedNumber = receipt.whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanedNumber.length === 10 && cleanedNumber.startsWith('9')) {
      cleanedNumber = '977' + cleanedNumber;
    }
    const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;

    // Try web share if available
    if (navigator.canShare && receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], getFilename('jpg'), { type: 'image/jpeg' });
            if (navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: 'Digital Solution Receipt',
                  text: message,
                });
                return; // Successful share
              } catch (e) {
                console.error("Error sharing", e);
                window.open(whatsappUrl, '_blank'); // fallback
              }
            } else {
              window.open(whatsappUrl, '_blank');
            }
          } else {
            window.open(whatsappUrl, '_blank');
          }
        }, 'image/jpeg');
        return;
      } catch (err) {
        console.error("Error generating image for share", err);
      }
    }

    // Fallback if no web share
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <Link to="/receipts" className="text-gray-500 hover:text-purple-900 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Receipts
        </Link>
        <div className="flex gap-4">
          {profile?.role === 'admin' && (
            <button onClick={() => navigate(`/edit/${receipt.id}`)} className="flex items-center gap-2 px-4 py-2 border border-orange-300 rounded-sm text-sm font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors mr-2">
              <Edit className="w-4 h-4" /> Edit Receipt
            </button>
          )}
          <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm text-sm font-semibold bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={downloadJPG} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm text-sm font-semibold bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <FileImage className="w-4 h-4" /> Download JPG
          </button>
          <button onClick={sendWhatsApp} className="flex items-center gap-2 px-6 py-2 bg-[#25D366] text-white rounded-sm text-sm font-semibold hover:bg-[#20bd5a] transition-colors">
            <Send className="w-4 h-4" /> Share / WhatsApp
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        {/* Receipt Container */}
        <div 
          ref={receiptRef}
          className="bg-white border border-gray-200 p-8 sm:p-12 w-full max-w-2xl relative flex flex-col font-sans"
          style={{ minHeight: '600px' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="w-12 h-12 bg-purple-900 rounded-sm flex items-center justify-center text-white font-bold text-xl mb-2">DS</div>
              <h3 className="text-purple-900 font-bold uppercase tracking-tight">Digital Solution</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Receipt Number</p>
              <p className="text-sm font-bold text-purple-900 mb-2">{receipt.receiptNumber}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</p>
              <p className="text-sm font-bold text-purple-900">{new Date(receipt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Billed To</p>
            <p className="text-lg font-bold text-gray-800">{receipt.customerName}</p>
            <p className="text-xs text-purple-900 font-medium">{receipt.whatsappNumber}</p>
          </div>

          {/* Services Table */}
          <div className="flex-1 min-h-[140px] mb-8">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left py-3">Description</th>
                  <th className="text-right py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {receipt.services.map((service, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-4 font-medium">{service.name}</td>
                    <td className="py-4 text-right font-bold text-gray-900">{formatCurrency(service.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-purple-900 text-white p-4 rounded-sm flex justify-between items-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest opacity-80">Total Paid</span>
            <span className="text-xl font-bold">{formatCurrency(receipt.totalAmount)}</span>
          </div>
          <div className="mb-8 text-xs text-gray-600 font-medium">
            <span className="text-gray-400 font-bold uppercase tracking-wider mr-2">Amount in words:</span>
            {numberToWords(receipt.totalAmount)} Rupees Only
          </div>

          {/* Payment Details & Footer */}
          <div className="flex justify-between items-end mb-8 mt-auto z-10">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Payment Method</p>
              <p className="text-xs font-bold text-purple-900">{receipt.paymentMethod}</p>
              {receipt.transactionId && (
                <>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 mt-2">Transaction ID</p>
                  <p className="text-xs font-medium text-gray-600">{receipt.transactionId}</p>
                </>
              )}
              {receipt.staffName && (
                <>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 mt-2">Payment Verified By</p>
                  <p className="text-xs font-medium text-gray-600">{receipt.staffName}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 italic">This is a computer-generated receipt.</p>
            </div>
          </div>

          {receipt.remarks && (
            <div className="mb-8 text-xs bg-gray-50 p-4 rounded-sm border border-gray-200 z-10">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Remarks</p>
              <p className="text-gray-600 whitespace-pre-wrap">{receipt.remarks}</p>
            </div>
          )}

          {/* Soft Orange Accent Line */}
          <div className="h-1 bg-orange-500 w-full absolute bottom-0 left-0"></div>
        </div>
      </div>
    </div>
  );
}
