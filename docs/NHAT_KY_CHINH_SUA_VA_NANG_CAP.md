# NHẬT KÝ CẬP NHẬT & NÂNG CẤP HỆ THỐNG

> **Mục tiêu:** Chuẩn hóa độ chính xác nghiệp vụ (QĐ 2626/QĐ-BTNMT & ISO 14064-1), an toàn dữ liệu Cloud, phân quyền giao diện độc quyền theo từng vai trò (UX) và đảm bảo toàn bộ hệ thống vượt qua 91 bài kiểm thử tự động.

---

## DANH SÁCH CÁC TỆP ĐÃ CẬP NHẬT

1. **`assets/js/invoice-parser.js`**
   * Chuẩn hóa hệ số phát thải nhiên liệu sinh khối về nguồn dữ liệu dùng chung (`EF_MASTER`) và tách riêng phát thải sinh học ($\text{CO}_2$ Biogenic).

2. **`assets/js/calculator.js`**
   * Chuẩn hóa công thức tính phát thải nước thải theo đúng hệ số chuẩn của Bộ Tài nguyên & Môi trường.

3. **`assets/js/supabase-client.js`**
   * Cập nhật cơ chế lưu trữ theo từng chi nhánh/nhà máy độc lập, phân rã chi tiết 3 loại khí nhà kính ($\text{CO}_2, \text{CH}_4, \text{N}_2\text{O}$) và tạo mã băm xác thực hồ sơ CBAM.

4. **`login.html`**, **`carbon-inventory.html`**, **`assets/js/carbon-activity.js`** & **`assets/js/carbon-company.js`**
   * Khóa bảo mật 1 tài khoản gắn liền với 1 vai trò cố định từ lúc đăng ký, bổ sung chọn ngành nghề ngay khi đăng ký và tự động đồng bộ không gian dữ liệu chung giữa các tài khoản nhân sự thuộc cùng một doanh nghiệp.
   * Hoàn thiện biểu mẫu khai báo thông số kỹ thuật thiết bị cho Kỹ sư và bổ sung chức năng Phê duyệt & Khóa sổ kỳ đối soát độc quyền cho Giám đốc ESG.

5. **`cbam-dashboard.html`**
   * Đồng bộ thanh điều hướng thông tin doanh nghiệp, vai trò tài khoản, hỗ trợ chế độ Xem Demo trực tiếp và tự động kế thừa thông tin cơ sở/ngành hàng từ phân hệ Kiểm kê KNK sang báo cáo CBAM.

6. **`server/app.py`**
   * Bổ sung các tiêu chuẩn bảo mật cho máy chủ web và trang thông báo 404 thân thiện điều hướng về trang chủ.

7. **`index.html`**
   * Cho phép truy cập trực tiếp chế độ Xem Demo không cần đăng nhập/đăng ký, bổ sung nút Đăng nhập rõ ràng và tối ưu tốc độ tải trang.

8. **`docs/QUY_UOC_PHAT_TRIEN_WEB.md`**
   * Cập nhật quy ước kỹ thuật phát triển web và quy tắc kiểm toán số liệu khí nhà kính.

9. **`tests/test_step2_verification.js`** & **`tests/test_complete_a_to_z_audit.js`**
   * Tối ưu mã kiểm thử để tự động chạy mượt mà trên tất cả hệ điều hành (macOS, Windows, Linux).

---

10. **Cập nhật hệ số phát thải lưới điện quốc gia theo Công văn số 11232/BNNMT-BĐKH ngày 30/9/2026**
    * **`assets/js/ef-master.js` & `assets/js/ef_database.js`:** Cập nhật hệ số phát thải điện lưới mặc định thành 0.6187 tCO₂/MWh (0.6187 kgCO₂e/kWh), hỗ trợ tra cứu động theo năm: 2022 trở về trước dùng 0.6766, năm 2023 dùng 0.6592, các năm 2024, 2025, 2026 dùng 0.6187 theo Công văn số 11232/BNNMT-BĐKH ngày 30/9/2026.
    * **`assets/js/calculator.js`, `assets/js/equipment-db.js`, `assets/js/invoice-parser.js`, `assets/js/carbon-activity.js`, `supplier.html` & `cbam-dashboard.html`:** Tự động áp dụng hệ số phát thải theo năm quan sát/báo cáo được chọn, tự động nhân điện năng tiêu thụ với hệ số tương ứng.
    * **`carbon-inventory.html` & thư mục `templates/`:** Cập nhật 16 file mẫu Excel chuẩn ngành và logic tải file mẫu của Kỹ sư để tự động điền sẵn cột "Hệ số phát thải (EF)" theo năm báo cáo mà Ban Giám đốc đã chọn (ví dụ năm 2026 mặc định 0.6187); module nạp Excel tự động đọc và nhân số liệu phát thải. Đồng bộ 2 chiều năm báo cáo giữa Dashboard, Hoạt động và Báo cáo.
    * **`assets/js/word-export.js`, `templates/word/template_tagged.docx` & Báo cáo Excel:** Khi xuất báo cáo tự động, trích dẫn chuẩn hóa căn cứ pháp lý theo năm đã chọn: với năm 2026 (hoặc 2024-2026) hiển thị "Công văn số 11232/BNNMT-BĐKH ngày 30/9/2026 với hệ số chính thức là 0,6187 tCO₂/MWh", với năm 2023 trích dẫn hệ số 0,6592 tCO₂/MWh và năm 2022 trích dẫn 0,6766 tCO₂/MWh.
    * **`tests/test_grid_electricity_ef_cv_11232.js`:** Bổ sung bộ kịch bản kiểm thử tự động toàn diện cho hệ số điện lưới mới và tính toàn vẹn khi xuất báo cáo Word/Excel.

---

## KẾT QUẢ KIỂM THỬ
* **Bộ kiểm thử tự động (Node.js):** 92/92 kịch bản kiểm thử thành công (100% PASSED).
* **Kiểm tra liên kết hệ thống:** 0 liên kết bị lỗi.