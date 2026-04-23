import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { PdfDataResponse } from "../types";

// Register Khmer font
Font.register({
  family: "Kantumruy Pro",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/kantumruypro/v12/1q2TY5aECkp34vEBSPFOmJxwvk_pilU8OGNfyg1urEs0.ttf",
      fontWeight: 'normal',
    },
    {
      src: "https://fonts.gstatic.com/s/kantumruypro/v12/1q2TY5aECkp34vEBSPFOmJxwvk_pilU8OGNfyg2Jq0s0.ttf",
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Kantumruy Pro",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  ministryLogo: {
    width: 80,
    height: 80,
    marginHorizontal: "auto",
    marginBottom: 10,
  },
  nationalMotto: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  mottoLine: {
    width: 60,
    height: 1,
    backgroundColor: "#000000",
    marginHorizontal: "auto",
    marginTop: 4,
  },
  departmentInfo: {
    marginTop: 10,
    marginBottom: 1,
  },
  deptName: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleContainer: {
    textAlign: "center",
    // marginVertical: 9,
  },
  title: {
    fontSize: 9,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  dateArea: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 9,
  },
  table: {
    display: "flex",
    width: "100%",
    paddingTop: 1,
    paddingLeft: 1,
  },
  tableRow: {
    flexDirection: "row",
    width: "100%",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#F0F0F0",
    padding: 5,
    marginTop: -1,
    marginLeft: -1,
  },
  tableColSmallHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#F0F0F0",
    padding: 5,
    textAlign: "center",
    marginTop: -1,
    marginLeft: -1,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    marginTop: -1,
    marginLeft: -1,
  },
  tableColSmall: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -1,
    marginLeft: -1,
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
  },
  sportLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  footer: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerSection: {
    width: "40%",
    textAlign: "center",
  },
  footerTitle: {
    fontWeight: "bold",
    marginBottom: 40,
  },
  footerTitleEn: {
    fontSize: 8,
    opacity: 0.8,
  },
  totalRow: {
    backgroundColor: "#F8F8F8",
    fontWeight: "bold",
  },

  // Specific widths for our columns to ensure they perfectly sum to 100%
  w5: { width: '5%' },
  w10: { width: '10%' },
  w15: { width: '15%' },
  w20: { width: '20%' },
  w25: { width: '25%' },
  w30: { width: '30%' },
  w35: { width: '35%' },
  w40: { width: '40%' },

  metaSection: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'column',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
});

interface Props {
  data: PdfDataResponse;
}

const translateGender = (gender: string | null | undefined) => {
  if (!gender) return '-';
  const lower = gender.toLowerCase().trim();
  if (lower === 'male' || lower === 'm') return 'ប្រុស';
  if (lower === 'female' || lower === 'f') return 'ស្រី';
  return gender;
};

export const SportsListPDF = ({ data }: Props) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* 1. National Motto (Centered at top) */}
        <View style={styles.header}>
          <Text style={styles.nationalMotto}>ព្រះរាជាណាចក្រកម្ពុជា</Text>
          <Text style={styles.nationalMotto}>ជាតិ សាសនា ព្រះមហាក្សត្រ</Text>
          <View style={styles.mottoLine} />
        </View>

        {/* 2. Ministry Logo & Dept Name (Left aligned, below motto) */}
        <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
          <View style={{}}>
            <Image
              src="/ministry-logo.png"
              style={styles.ministryLogo}
            />
            <Text style={styles.deptName}>មន្ទីរអប់រំ យុវជន និងកីឡា {data.org_name}</Text>
          </View>
        </View>

        {/* 3. Event Meta Section */}
        <View style={styles.metaSection}>
          <Text style={styles.metaText}>អង្គភាព៖ {data.org_name}</Text>
          <Text style={styles.metaText}>ព្រឹត្តិការណ៍៖ {data.event_name}</Text>
          <Text style={styles.metaText}>ប្រភេទកីឡា៖ {data.sport_name}</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>បញ្ជីឈ្មោះប្រតិភូកីឡា និងកីឡាករ-កីឡាការិនី</Text>
        </View>

        {/* Leaders Section */}
        {data.leaders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>I. បញ្ជីឈ្មោះប្រតិភូកីឡា</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableColSmallHeader, styles.w5]}>
                  <Text style={styles.tableCellHeader}>ល.រ</Text>
                </View>
                <View style={[styles.tableColHeader, styles.w30]}>
                  <Text style={styles.tableCellHeader}>នាមត្រកូល និងនាមខ្លួន</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w10]}>
                  <Text style={styles.tableCellHeader}>ភេទ</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w20]}>
                  <Text style={styles.tableCellHeader}>ថ្ងៃខែឆ្នាំកំណើត</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w15]}>
                  <Text style={styles.tableCellHeader}>តួនាទី</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w20]}>
                  <Text style={styles.tableCellHeader}>ផ្សេងៗ</Text>
                </View>
              </View>
              {/* Table Body */}
              {data.leaders.map((leader, i) => (
                <View style={styles.tableRow} key={i} wrap={false}>
                  <View style={[styles.tableColSmall, styles.w5]}>
                    <Text style={styles.tableCell}>{i + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.w30]}>
                    <Text style={styles.tableCell}>{leader.name}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w10]}>
                    <Text style={styles.tableCell}>{translateGender(leader.gender)}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w20]}>
                    <Text style={styles.tableCell}>{leader.date_of_birth || '-'}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w15]}>
                    <Text style={styles.tableCell}>{leader.role}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w20]}>
                    <Text style={styles.tableCell}>{leader.other || ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Male Athletes Section */}
        {data.athletes_male.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>II. បញ្ជីឈ្មោះកីឡាករ</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableColSmallHeader, styles.w5]}>
                  <Text style={styles.tableCellHeader}>ល.រ</Text>
                </View>
                <View style={[styles.tableColHeader, styles.w35]}>
                  <Text style={styles.tableCellHeader}>នាមត្រកូល និងនាមខ្លួន</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w10]}>
                  <Text style={styles.tableCellHeader}>ភេទ</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w20]}>
                  <Text style={styles.tableCellHeader}>ថ្ងៃខែឆ្នាំកំណើត</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w30]}>
                  <Text style={styles.tableCellHeader}>វិញ្ញាសា/ប្រភេទ</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w20]}>
                  <Text style={styles.tableCellHeader}>ផ្សេងៗ</Text>
                </View>
              </View>
              {/* Table Body */}
              {data.athletes_male.map((athlete, i) => (
                <View style={styles.tableRow} key={i} wrap={false}>
                  <View style={[styles.tableColSmall, styles.w5]}>
                    <Text style={styles.tableCell}>{i + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.w35]}>
                    <Text style={styles.tableCell}>{athlete.name}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w10]}>
                    <Text style={styles.tableCell}>ប្រុស</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w20]}>
                    <Text style={styles.tableCell}>{athlete.date_of_birth || '-'}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w30]}>
                    <Text style={styles.tableCell}>{athlete.other || '-'}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w20]}>
                    <Text style={styles.tableCell}></Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Female Athletes Section */}
        {data.athletes_female.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>III. បញ្ជីឈ្មោះកីឡាការិនី (Female Athletes)</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableColSmallHeader, styles.w5]}>
                  <Text style={styles.tableCellHeader}>ល.រ</Text>
                </View>
                <View style={[styles.tableColHeader, styles.w35]}>
                  <Text style={styles.tableCellHeader}>នាមត្រកូល និងនាមខ្លួន</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w10]}>
                  <Text style={styles.tableCellHeader}>ភេទ</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w20]}>
                  <Text style={styles.tableCellHeader}>ថ្ងៃខែឆ្នាំកំណើត</Text>
                </View>
                <View style={[styles.tableColSmallHeader, styles.w30]}>
                  <Text style={styles.tableCellHeader}>វិញ្ញាសា/ប្រភេទ</Text>
                </View>
              </View>
              {/* Table Body */}
              {data.athletes_female.map((athlete, i) => (
                <View style={styles.tableRow} key={i} wrap={false}>
                  <View style={[styles.tableColSmall, styles.w5]}>
                    <Text style={styles.tableCell}>{i + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.w35]}>
                    <Text style={styles.tableCell}>{athlete.name}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w10]}>
                    <Text style={styles.tableCell}>ស្រី</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w20]}>
                    <Text style={styles.tableCell}>{athlete.date_of_birth || '-'}</Text>
                  </View>
                  <View style={[styles.tableColSmall, styles.w30]}>
                    <Text style={styles.tableCell}>{athlete.other || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>កាលបរិច្ឆេទ</Text>
            <Text>................................</Text>
          </View>
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>ហត្ថលេខា និងត្រា</Text>
            <Text>................................</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
