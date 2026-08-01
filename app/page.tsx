"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { FullInvoiceDocument, InvoiceData, Receipt80mmDocument } from "@/components/InvoicePDF";
import { Upload, Download, Loader2, FileCheck } from "lucide-react";

export default function Home() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ข้อมูลผู้ขาย (สามารถปรับเป็นข้อมูลร้านคุณได้)
  const myCompany = {
    companyName: "บริษัท ของเรา จำกัด (สำนักงานใหญ่)",
    companyAddress: "123/45 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110",
    companyTaxId: "0105550000000",
    companyPhone: "02-123-4567",
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Grouping ข้อมูลตามเลขที่เอกสาร (INV_NO)
      const groupedMap = new Map<string, InvoiceData>();

      jsonData.forEach((row) => {
        const invNo = String(row["เลขที่เอกสาร"] || row["INV_NO"] || "");
        if (!invNo) return;

        const item = {
          description: String(row["รายการ"] || row["ITEM"] || ""),
          quantity: Number(row["จำนวน"] || row["QTY"] || 1),
          unitPrice: Number(row["ราคาต่อหน่วย"] || row["PRICE"] || 0),
          discountPercentage: Number(row["ส่วนลด%"] || row["DISCOUNT"] || 0),
        };

        if (groupedMap.has(invNo)) {
          groupedMap.get(invNo)!.items.push(item);
        } else {
          groupedMap.set(invNo, {
            ...myCompany,
            invoiceNo: invNo,
            invoiceDate: String(row["วันที่"] || row["DATE"] || ""),
            customerName: String(row["ชื่อลูกค้า"] || row["CUSTOMER_NAME"] || ""),
            customerAddress: String(row["ที่อยู่ลูกค้า"] || row["CUSTOMER_ADDRESS"] || ""),
            customerTaxId: String(row["เลขผู้เสียภาษี"] || row["TAX_ID"] || ""),
            items: [item],
          });
        }
      });

      setInvoices(Array.from(groupedMap.values()));
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    multiple: false,
  });

  const downloadZip = async () => {
    if (invoices.length === 0) return;
    setLoading(true);
    setProgress(0);

    const zip = new JSZip();

    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];

      // 1. สร้าง PDF แบบเต็ม (A4)
      const fullBlob = await pdf(<FullInvoiceDocument data={inv} />).toBlob();
      zip.file(`Invoice_${inv.invoiceNo}_Full.pdf`, fullBlob);

      // 2. สร้าง PDF แบบย่อ (80mm)
      const posBlob = await pdf(<Receipt80mmDocument data={inv} />).toBlob();
      zip.file(`Invoice_${inv.invoiceNo}_80mm.pdf`, posBlob);

      setProgress(Math.round(((i + 1) / invoices.length) * 100));
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoices_Pack_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    setLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-8 font-sans text-center">
      <h1 className="text-3xl font-bold mb-2 text-white">ระบบสร้างใบกำกับภาษี</h1>
      <p className="text-gray-300 mb-8">แปลงไฟล์ Excel เป็น PDF ใบกำกับภาษี</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-300 font-medium">
          {isDragActive ? "วางไฟล์ Excel ตรงนี้..." : "ลากไฟล์ Excel (.xlsx) มาวาง หรือคลิกเพื่อเลือกไฟล์"}
        </p>
      </div>

      {invoices.length > 0 && (
        <div className="mt-8 bg-white border rounded-xl p-6 shadow-sm">
          <div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">พบใบกำกับภาษี {invoices.length} ใบ</h2>
              <p className="text-sm text-gray-500">พร้อมประมวลผลเป็นไฟล์ PDF</p>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={downloadZip}
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
          </div>
        </div>
      )}
    </main>
  );
}
