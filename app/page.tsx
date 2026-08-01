'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { InvoiceDocument, InvoiceData } from '@/components/InvoicePDF';
import { Upload, FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const parsed: InvoiceData[] = jsonData.map((row) => ({
        invNo: String(row['เลขที่เอกสาร'] || row['INV_NO'] || ''),
        date: String(row['วันที่'] || row['DATE'] || ''),
        customerName: String(row['ชื่อลูกค้า'] || row['CUSTOMER_NAME'] || ''),
        taxId: String(row['เลขผู้เสียภาษี'] || row['TAX_ID'] || ''),
        item: String(row['รายการ'] || row['ITEM'] || ''),
        amount: Number(row['จำนวนเงิน'] || row['AMOUNT'] || 0),
      }));

      setInvoices(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false,
  });

  // ดาวน์โหลดเป็นไฟล์ ZIP มัดรวม 3,000 ใบ
  const downloadAllAsZip = async () => {
    if (invoices.length === 0) return;
    setLoading(true);
    setProgress(0);

    const zip = new JSZip();

    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      const blob = await pdf(<InvoiceDocument data={inv} />).toBlob();
      zip.file(`Invoice_${inv.invNo || i + 1}.pdf`, blob);
      setProgress(Math.round(((i + 1) / invoices.length) * 100));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoices_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    setLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">ระบบออกใบกำกับภาษีอัตโนมัติ</h1>
      <p className="text-gray-500 mb-8">แปลงไฟล์ Excel เป็น PDF ใบกำกับภาษีพร้อมมัดรวมดาวน์โหลด</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600 font-medium">
          {isDragActive ? 'วางไฟล์ Excel ตรงนี้...' : 'ลากไฟล์ Excel (.xlsx) มาวาง หรือคลิกเลือกไฟล์'}
        </p>
      </div>

      {invoices.length > 0 && (
        <div className="mt-8 bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">พบข้อมูลทั้งหมด {invoices.length} รายการ</h2>
              <p className="text-sm text-gray-500">พร้อมสำหรับการสร้างไฟล์ PDF</p>
            </div>
            <button
              onClick={downloadAllAsZip}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> กำลังสร้าง PDF ({progress}%)
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" /> ดาวน์โหลดทั้งหมด (.ZIP)
                </>
              )}
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">เลขที่</th>
                  <th className="p-3">ลูกค้า</th>
                  <th className="p-3">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{inv.invNo}</td>
                    <td className="p-3">{inv.customerName}</td>
                    <td className="p-3">{inv.amount.toLocaleString()} บาท</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}