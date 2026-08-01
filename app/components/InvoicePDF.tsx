import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// ลงทะเบียนฟอนต์ภาษาไทย (Sarabun)
Font.register({
  family: 'THSarabun',
  src: 'https://cdn.jsdelivr.net/npm/th-sarabun-new@1.0.0/fonts/THSarabunNew-webfont.ttf',
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'THSarabun', fontSize: 14 },
  header: { fontSize: 22, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 10 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#ccc', marginTop: 10 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { width: '50%', backgroundColor: '#f3f4f6', padding: 6, fontWeight: 'bold' },
  tableCol: { width: '50%', padding: 6 },
});

export interface InvoiceData {
  invNo: string;
  date: string;
  customerName: string;
  taxId: string;
  item: string;
  amount: number;
}

export const InvoiceDocument = ({ data }: { data: InvoiceData }) => {
  const vat = (data.amount || 0) * 0.07;
  const grandTotal = (data.amount || 0) + vat;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>ใบกำกับภาษี / TAX INVOICE</Text>

        <View style={styles.section}>
          <Text>เลขที่เอกสาร: {data.invNo}</Text>
          <Text>วันที่: {data.date}</Text>
          <Text>ชื่อลูกค้า: {data.customerName}</Text>
          <Text>เลขประจำตัวผู้เสียภาษี: {data.taxId}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>รายการ (Description)</Text>
            <Text style={styles.tableColHeader}>จำนวนเงิน (Amount)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>{data.item}</Text>
            <Text style={styles.tableCol}>{(data.amount || 0).toLocaleString()} บาท</Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 20, alignItems: 'flex-end' }]}>
          <Text>มูลค่าสินค้า/บริการ: {(data.amount || 0).toLocaleString()} บาท</Text>
          <Text>ภาษีมูลค่าเพิ่ม 7%: {vat.toLocaleString()} บาท</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            จำนวนเงินรวมทั้งสิ้น: {grandTotal.toLocaleString()} บาท
          </Text>
        </View>
      </Page>
    </Document>
  );
};