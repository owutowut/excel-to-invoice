import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Sarabun',
  fonts: [
    {
      src: '/fonts/Sarabun-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Sarabun-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
}

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyTaxId: string;
  companyPhone: string;
  invoiceNo: string;
  invoiceDate: string;
  customerName?: string;
  customerAddress?: string;
  customerTaxId?: string;
  items: InvoiceItem[];
}

const fullStyles = StyleSheet.create({
  // ✅ แก้ fontFamily ให้เป็น 'Sarabun' ให้ตรงกับ Font.register
  page: { padding: 30, fontFamily: 'Sarabun', fontSize: 14, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#1B365D' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B365D', textAlign: 'right' },
  customerBox: { borderStyle: 'solid', borderWidth: 1, borderColor: '#E5E7EB', padding: 10, marginBottom: 15, borderRadius: 4 },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, marginTop: 5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', minHeight: 24, alignItems: 'center' },
  colNo: { width: '8%', textAlign: 'center' },
  colDesc: { width: '42%', paddingLeft: 5 },
  colQty: { width: '12%', textAlign: 'right', paddingRight: 5 },
  colPrice: { width: '13%', textAlign: 'right', paddingRight: 5 },
  colDiscount: { width: '10%', textAlign: 'right', paddingRight: 5 },
  colAmount: { width: '15%', textAlign: 'right', paddingRight: 5 },
  calcBox: { width: '45%', alignSelf: 'flex-end', marginTop: 10, padding: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
});

// Component ใบกำกับภาษีเต็มรูป (A4)
export const FullInvoiceDocument = ({ data }: { data: InvoiceData }) => {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discount = data.items.reduce((s, i) => s + (i.discountPercentage ? (i.quantity * i.unitPrice * i.discountPercentage) / 100 : 0), 0);
  const net = subtotal - discount;
  const vat = net * 0.07;
  const grandTotal = net + vat;

  return (
    <Document>
      <Page size="A4" style={fullStyles.page}>
        <View style={fullStyles.header}>
          <View style={{ width: '60%' }}>
            <Text style={fullStyles.companyName}>{data.companyName}</Text>
            <Text>{data.companyAddress}</Text>
            <Text>เลขประจำตัวผู้เสียภาษี: {data.companyTaxId}</Text>
            <Text>โทร: {data.companyPhone}</Text>
          </View>
          <View style={{ width: '40%' }}>
            <Text style={fullStyles.title}>ใบกำกับภาษี / ใบเสร็จรับเงิน</Text>
            <Text style={{ textAlign: 'right' }}>เลขที่: {data.invoiceNo}</Text>
            <Text style={{ textAlign: 'right' }}>วันที่: {data.invoiceDate}</Text>
          </View>
        </View>

        <View style={fullStyles.customerBox}>
          <Text style={{ fontWeight: 'bold' }}>ลูกค้า: {data.customerName || '-'}</Text>
          <Text>{data.customerAddress || '-'}</Text>
          <Text>เลขผู้เสียภาษี: {data.customerTaxId || '-'}</Text>
        </View>

        <View style={fullStyles.table}>
          <View style={[fullStyles.tableRow, { backgroundColor: '#F3F4F6' }]}>
            <Text style={fullStyles.colNo}>#</Text>
            <Text style={fullStyles.colDesc}>รายการ</Text>
            <Text style={fullStyles.colQty}>จำนวน</Text>
            <Text style={fullStyles.colPrice}>ราคา/หน่วย</Text>
            <Text style={fullStyles.colDiscount}>ส่วนลด</Text>
            <Text style={fullStyles.colAmount}>จำนวนเงิน</Text>
          </View>
          {data.items.map((item, idx) => {
            const lineTotal = item.quantity * item.unitPrice;
            const lineDisc = item.discountPercentage ? (lineTotal * item.discountPercentage) / 100 : 0;
            return (
              <View style={fullStyles.tableRow} key={idx}>
                <Text style={fullStyles.colNo}>{idx + 1}</Text>
                <Text style={fullStyles.colDesc}>{item.description}</Text>
                <Text style={fullStyles.colQty}>{item.quantity}</Text>
                <Text style={fullStyles.colPrice}>{item.unitPrice.toLocaleString()}</Text>
                <Text style={fullStyles.colDiscount}>{item.discountPercentage ? `${item.discountPercentage}%` : '-'}</Text>
                <Text style={fullStyles.colAmount}>{(lineTotal - lineDisc).toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        <View style={fullStyles.calcBox}>
          <View style={fullStyles.calcRow}><Text>รวมเป็นเงิน:</Text><Text>{subtotal.toLocaleString()} บาท</Text></View>
          <View style={fullStyles.calcRow}><Text>ส่วนลด:</Text><Text>-{discount.toLocaleString()} บาท</Text></View>
          <View style={fullStyles.calcRow}><Text>ภาษี VAT 7%:</Text><Text>{vat.toLocaleString()} บาท</Text></View>
          <View style={[fullStyles.calcRow, { borderTopWidth: 1, paddingTop: 4 }]}>
            <Text style={{ fontWeight: 'bold' }}>รวมทั้งสิ้น:</Text>
            <Text style={{ fontWeight: 'bold' }}>{grandTotal.toLocaleString()} บาท</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Style สำหรับสลิปย่อขนาด 80mm
const receipt80mmStyles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Sarabun',
    fontSize: 10,
    color: '#000',
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 3,
    marginBottom: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    marginVertical: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justify: 'space-between',
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  colDesc: { width: '45%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 9,
  },
});

// Component ใบกำกับภาษีอย่างย่อ (ขนาด 80mm)
export const Receipt80mmDocument = ({ data }: { data: InvoiceData }) => {
  const subtotal = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discount = data.items.reduce(
    (s, i) => s + (i.discountPercentage ? (i.quantity * i.unitPrice * i.discountPercentage) / 100 : 0),
    0
  );
  const net = subtotal - discount;
  const vat = net * 0.07;
  const grandTotal = net + vat;

  return (
    <Document>
      {/* กำหนด size เท่ากับความกว้าง 80mm (ประมาณ 226pt) และความยาวแบบ auto */}
      <Page size={[226, 600]} style={receipt80mmStyles.page}>
        {/* Header ร้านค้า */}
        <View style={receipt80mmStyles.header}>
          <Text style={receipt80mmStyles.companyName}>{data.companyName}</Text>
          <Text>เลขผู้เสียภาษี: {data.companyTaxId}</Text>
          <Text>{data.companyAddress}</Text>
          <Text>โทร: {data.companyPhone}</Text>
          <Text style={receipt80mmStyles.title}>ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน</Text>
        </View>

        <View style={receipt80mmStyles.divider} />

        {/* รายละเอียดเอกสาร & ลูกค้า */}
        <View style={receipt80mmStyles.infoRow}>
          <Text>เลขที่: {data.invoiceNo}</Text>
          <Text>วันที่: {data.invoiceDate}</Text>
        </View>
        {data.customerName && (
          <View style={{ marginBottom: 2 }}>
            <Text>ลูกค้า: {data.customerName}</Text>
            {data.customerTaxId && <Text>Tax ID: {data.customerTaxId}</Text>}
          </View>
        )}

        <View style={receipt80mmStyles.divider} />

        {/* ตารางรายการสินค้า */}
        <View style={receipt80mmStyles.tableHeader}>
          <Text style={receipt80mmStyles.colDesc}>รายการ</Text>
          <Text style={receipt80mmStyles.colQty}>จำนวน</Text>
          <Text style={receipt80mmStyles.colPrice}>ราคา</Text>
          <Text style={receipt80mmStyles.colTotal}>รวม</Text>
        </View>

        {data.items.map((item, idx) => {
          const lineTotal = item.quantity * item.unitPrice;
          const lineDisc = item.discountPercentage ? (lineTotal * item.discountPercentage) / 100 : 0;
          return (
            <View style={receipt80mmStyles.tableRow} key={idx}>
              <Text style={receipt80mmStyles.colDesc}>{item.description}</Text>
              <Text style={receipt80mmStyles.colQty}>{item.quantity}</Text>
              <Text style={receipt80mmStyles.colPrice}>{item.unitPrice.toLocaleString()}</Text>
              <Text style={receipt80mmStyles.colTotal}>{(lineTotal - lineDisc).toLocaleString()}</Text>
            </View>
          );
        })}

        <View style={receipt80mmStyles.divider} />

        {/* สรุปยอดเงิน */}
        <View style={receipt80mmStyles.totalRow}>
          <Text>รวมเงิน:</Text>
          <Text>{subtotal.toLocaleString()}</Text>
        </View>
        {discount > 0 && (
          <View style={receipt80mmStyles.totalRow}>
            <Text>ส่วนลด:</Text>
            <Text>-{discount.toLocaleString()}</Text>
          </View>
        )}
        <View style={receipt80mmStyles.totalRow}>
          <Text>VAT 7% (รวมในยอด):</Text>
          <Text>{vat.toLocaleString()}</Text>
        </View>

        <View style={receipt80mmStyles.grandTotal}>
          <Text>ยอดชำระสุทธิ:</Text>
          <Text>{grandTotal.toLocaleString()} บาท</Text>
        </View>

        <View style={receipt80mmStyles.divider} />

        {/* ท้ายใบเสร็จ */}
        <View style={receipt80mmStyles.footer}>
          <Text>ขอบคุณที่ใช้บริการ</Text>
          <Text>*(ราคารวมภาษีมูลค่าเพิ่มแล้ว)*</Text>
        </View>
      </Page>
    </Document>
  );
};