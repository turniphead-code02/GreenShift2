const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TEST: CẬP NHẬT HỆ SỐ PHÁT THẢI ĐIỆN LƯỚI THEO CÔNG VĂN 11232');
console.log('================================================================');

// 1. Kiểm tra EF Master DB
const EF_MASTER = require(path.join(__dirname, '..', 'assets', 'js', 'ef-master.js'));
assert.ok(EF_MASTER, 'EF_MASTER phải tồn tại');
global.EF_MASTER = EF_MASTER;
global.window = {
  EF_MASTER,
  getGridElectricityEFInfo: EF_MASTER.CALC.getGridElectricityEFInfo,
  getGridElectricityEF: EF_MASTER.CALC.getGridElectricityEF
};

// Kiểm tra hàm getGridElectricityEFInfo theo các mốc năm
const info2022 = EF_MASTER.CALC.getGridElectricityEFInfo('2022');
assert.strictEqual(info2022.factor, 0.6766, 'Năm 2022 hệ số điện phải là 0.6766');
assert.strictEqual(info2022.factorComma, '0,6766');

const info2023 = EF_MASTER.CALC.getGridElectricityEFInfo('2023');
assert.strictEqual(info2023.factor, 0.6592, 'Năm 2023 hệ số điện phải là 0.6592');
assert.strictEqual(info2023.factorComma, '0,6592');

const info2024 = EF_MASTER.CALC.getGridElectricityEFInfo('2024');
assert.strictEqual(info2024.factor, 0.6187, 'Năm 2024 hệ số điện phải là 0.6187');

const info2025 = EF_MASTER.CALC.getGridElectricityEFInfo('2025');
assert.strictEqual(info2025.factor, 0.6187, 'Năm 2025 hệ số điện phải là 0.6187');

const info2026 = EF_MASTER.CALC.getGridElectricityEFInfo('2026');
assert.strictEqual(info2026.factor, 0.6187, 'Năm 2026 hệ số điện phải là 0.6187');
assert.strictEqual(info2026.factorComma, '0,6187');
assert.ok(info2026.doc.includes('Công văn số 11232/BNNMT-BĐKH ngày 30/9/2026'), 'Văn bản pháp lý 2026 phải là CV 11232');
assert.ok(info2026.doc.includes('0,6187 tCO₂/MWh'), 'Văn bản pháp lý phải ghi rõ 0,6187 tCO₂/MWh');

console.log('  [PASS] EF_MASTER getGridElectricityEFInfo phân bổ đúng 100% theo các mốc năm.');

// 2. Kiểm tra Calculator tính toán Scope 2 theo năm
const Calculator = require(path.join(__dirname, '..', 'assets', 'js', 'calculator.js'));

// Test tính 2022: 100,000 kWh * 0.6766 / 1000 = 67.66 tCO2e
const res2022 = Calculator.calcScope2({ s2_grid_kwh: 100000, year: '2022' });
assert.strictEqual(res2022.total, 67.66, 'Năm 2022 phát thải phải tính theo hệ số 0.6766');

// Test tính 2023: 100,000 kWh * 0.6592 / 1000 = 65.92 tCO2e
const res2023 = Calculator.calcScope2({ s2_grid_kwh: 100000, year: '2023' });
assert.strictEqual(res2023.total, 65.92, 'Năm 2023 phát thải phải tính theo hệ số 0.6592');

// Test tính 2026: 100,000 kWh * 0.6187 / 1000 = 61.87 tCO2e
const res2026 = Calculator.calcScope2({ s2_grid_kwh: 100000, year: '2026' });
assert.strictEqual(res2026.total, 61.87, 'Năm 2026 phát thải phải tính theo hệ số mới 0.6187');

console.log('  [PASS] Calculator.calcScope2 nhân đúng hệ số theo từng năm báo cáo.');

// 3. Kiểm tra Xuất báo cáo Word (WordExport)
const WordExport = require(path.join(__dirname, '..', 'assets', 'js', 'word-export.js'));
const mockCompany = {
  name: 'Công ty Cổ phần Thép Xanh Việt Nam',
  tax: '0101234567',
  repName: 'Giám Đốc Kiểm Kê'
};
const mockElecActivity = [
  {
    sourceName: 'Trạm điện biến áp sản xuất',
    sourceType: 'Tiêu thụ điện',
    amount: 1000000,
    unit: 'kWh',
    category: 'Phạm vi 2'
  }
];

// Xuất báo cáo 2026
const doc2026 = WordExport.exportReport(mockCompany, null, '2026', mockElecActivity);
assert.ok(doc2026, 'Phải tạo thành công docx');
const xml2026 = doc2026.getZip().file('word/document.xml').asText();
assert.ok(xml2026.includes('0,6187'), 'Báo cáo năm 2026 phải chứa hệ số 0,6187');
assert.ok(xml2026.includes('Công văn số 11232/BNNMT-BĐKH ngày 30/9/2026 với hệ số chính thức là 0,6187 tCO₂/MWh'), 'Báo cáo 2026 phải chứa đúng tên Công văn số 11232');

// Xuất báo cáo 2022
const doc2022 = WordExport.exportReport(mockCompany, null, '2022', mockElecActivity);
const xml2022 = doc2022.getZip().file('word/document.xml').asText();
assert.ok(xml2022.includes('0,6766'), 'Báo cáo năm 2022 phải chứa hệ số 0,6766');

console.log('  [PASS] WordExport tự động gắn văn bản pháp lý và hệ số chính thức theo năm đã chọn.');

console.log('\n================================================================');
console.log('TẤT CẢ CÁC BÀI KIỂM TRA HỆ SỐ PHÁT THẢI 11232 ĐẠT 100%!');
console.log('================================================================');
