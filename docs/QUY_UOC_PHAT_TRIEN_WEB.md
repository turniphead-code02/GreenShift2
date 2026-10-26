# BỘ QUY ƯỚC PHÁT TRIỂN WEB & TOÀN VẸN DỮ LIỆU GREENSHIFT (GREENSHIFT WEB & CARBON ENGINEERING STANDARD)
*Phiên bản: 2.1 — Chuẩn hóa cho nền tảng Kiểm kê Khí nhà kính (NĐ 06/2022/NĐ-CP, QĐ 2626/QĐ-BTNMT) & Báo cáo Thuế Carbon EU CBAM*

---

## 1. QUY ƯỚC HẠ TẦNG MẠNG, ĐỊNH DANH & BẢO MẬT (Networking, Protocols & Security)

### 1.1. Mô hình Kiến trúc Phân tầng của GreenShift
* **Client Layer (Local-First Web Workspace):**
  * Giao diện Multi-Page Web App (`index.html`, `carbon-inventory.html`, `cbam-dashboard.html`, `login.html`, `setup.html`, `supplier.html`).
  * Lõi tính toán Client-Side (`assets/js/ef-master.js`, `assets/js/calculator.js`, `assets/js/carbon-activity.js`) hoạt động tức thì (Zero Server Round-trip) và hỗ trợ chế độ Offline-First qua `localStorage` + đồng bộ hai chiều với đám mây.
* **Edge & Reverse Proxy Layer (Vercel Edge / Cloudflare / Nginx):**
  * Tiếp nhận traffic HTTPS, chống DDoS, xử lý SSL/TLS Termination và phân phối tài nguyên tĩnh (`assets/`).
* **Backend & API Service Layer:**
  * **Python Flask (`server/app.py`):** Xác thực JWT đa cơ sở (`facility_id`), chống Brute-force Login, tra cứu hệ số mặc định EU (`server/services/lookup_service.py`) và kết xuất phôi Excel chuẩn Ủy ban Châu Âu (`server/services/cbam_service.py`).
  * **Serverless Functions (`api/*.js`):** Các điểm cuối phụ trợ cho lưu trữ đám mây và phê chuẩn chuyên gia (`api/expert-attest.js`).
* **Data & Storage Layer:**
  * **Supabase PostgreSQL (`data/reference/greenshift_supabase.sql`):** Lưu trữ bền vững đa cơ sở (`facilities`, `activities`, `inventory_reports`, `cbam_dossiers`, `audit_logs`) kèm chính sách Row Level Security (RLS).
  * **Kho Phôi Chuẩn (`templates/`):** Chứa phôi Excel 6 ngành EU CBAM (`templates/excel/`) và phôi báo cáo Word Nghị định 06 (`templates/word/`).

### 1.2. Cổng dịch vụ (Service Ports) & Quy tắc chuyển tiếp
* **Port 80 (HTTP):** Mở duy nhất cho mục đích tự động chuyển hướng **(HTTP 301 Permanent Redirect)** sang HTTPS (Port 443) trên môi trường Production.
* **Port 443 (HTTPS):** Cổng tiêu chuẩn phục vụ toàn bộ lưu lượng web Production.
* **Port 5000 (Local Dev):** Cổng mặc định khi chạy máy chủ phát triển Flask cục bộ (`http://localhost:5000` hoặc `http://127.0.0.1:5000`).
* **Quy chuẩn truyền tải tệp/mã nguồn:**
  * **NGHIÊM CẤM** sử dụng FTP truyền thống (Port 21) do truyền plaintext lộ mật khẩu.
  * Thay thế 100% bằng: **SSH/SFTP (Port 22)** hoặc tự động hóa triển khai qua **Git CI/CD Pipeline**.

### 1.3. Giao thức Truyền tải & Tiêu đề Bảo mật Web (HTTP Security Headers)
* **HTTP/2 & HTTP/3:** Kích hoạt trên tầng CDN/Edge để tối ưu tốc độ tải các bảng dữ liệu lớn và phôi báo cáo.
* **Bảo mật HTTPS, CORS & HTTP Headers (Thực thi tại `server/app.py`):**
  * **CORS Whitelist:** Tuyệt đối không dùng wildcard `*` cho các API có xác thực; chỉ cho phép các nguồn trong `ALLOWED_ORIGINS`.
  * **Chặn truy cập tệp nhạy cảm (`block_sensitive_requests`):** Chặn tuyệt đối truy cập trực tiếp qua HTTP vào `.env`, `data/`, `server/`, `tests/`, `.git`, `*.py`, `*.sql`, `*.md`.
  * **Tiêu đề bảo mật bắt buộc (`apply_security_headers`):**
    * `X-Content-Type-Options: nosniff` (Chống MIME-sniffing).
    * `X-Frame-Options: SAMEORIGIN` (Chống Clickjacking).
    * `Referrer-Policy: strict-origin-when-cross-origin`.
    * `Permissions-Policy: geolocation=(), microphone=(), camera=()`.
    * `Strict-Transport-Security (HSTS): max-age=31536000; includeSubDomains` (Bắt buộc trên Production).

### 1.4. Quy chuẩn Định dạng URL & Định tuyến Hỗn hợp (Hybrid Routing)
* **Cú pháp URL chuẩn RESTful:**
  ```text
  https://[domain][:port][/api/endpoint] hoặc [/ten-trang-kebab-case]
  ```
* **Quy tắc đặt tên đường dẫn (Slug Rules):**
  * Sử dụng chữ thường hoàn toàn, nối các từ bằng dấu gạch ngang (`kebab-case`). *Ví dụ:* `/carbon-inventory`, `/cbam-dashboard`, `/api/generate-report`, `/api/lookup-default`.
  * **Hỗ trợ định tuyến kép (Hybrid Static & Clean Route tại `server/app.py`):** Máy chủ hỗ trợ song song đường dẫn sạch (`/carbon-inventory`, `/cbam-dashboard`, `/login`) và đường dẫn tĩnh có đuôi `.html` (`/carbon-inventory.html`) để đảm bảo tương thích 100% cả khi triển khai trên Cloud lẫn khi chạy kiểm thử cục bộ.

---

## 2. QUY ƯỚC KIẾN TRÚC & CHUẨN GIAO TIẾP API (Architecture & Output Standards)

### 2.1. Mô hình Ứng dụng Kết hợp của GreenShift
GreenShift áp dụng mô hình **Hybrid Web Application** tối ưu cho từng phân khu:

| Phân khu | Mô hình áp dụng | Các tệp đại diện | Mục tiêu kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Trang Chủ & Giới thiệu** | **Static Landing Page (SSG/Static HTML)** | `index.html`, `about.html` | Tốc độ tải tức thì (TTFB cực thấp), chuẩn SEO, tương tác nhẹ với công cụ tính thử dấu chân carbon. |
| **Không gian Kiểm kê KNK & CBAM** | **Local-First Rich Web App** | `carbon-inventory.html`, `cbam-dashboard.html`, `setup.html` | Xử lý bảng dữ liệu hàng nghìn bản ghi mượt mà trên trình duyệt, tính toán tức thì không độ trễ mạng, đồng bộ đám mây hai chiều. |
| **Xử lý Phôi Báo cáo & Xác thực** | **RESTful API & Binary Stream Server** | `server/app.py`, `server/services/cbam_service.py` | Điền phôi Excel gốc của Ủy ban Châu Âu (`openpyxl`) và trả về luồng nhị phân `.xlsx` bảo toàn công thức. |

### 2.2. Quy ước Giao diện & Dữ liệu đầu ra (Output Rules)
* **Quy ước Client/Browser (Giao diện):**
  * Sử dụng **HTML5 ngữ nghĩa (Semantic HTML)**: `<nav>`, `<main>`, `<section>`, `<footer>`.
  * **Quy tắc ZERO EMOJIS trong giao diện phần mềm chuyên nghiệp:** Trong các bảng số liệu kỹ thuật, modal đồng bộ đám mây (`assets/js/supabase-ui.js`) và bộ chọn hóa đơn (`assets/js/invoice-parser.js`), sử dụng **100% biểu tượng SVG вектор và CSS Status Dot** thay cho ký tự emoji để đảm bảo tính nghiêm cẩn của phần mềm kiểm toán doanh nghiệp.
* **Quy ước API (Giao tiếp Frontend - Backend):**
  * Các API trả dữ liệu JSON tuân thủ cấu trúc rõ ràng:
    ```json
    {
      "success": true,
      "message": "Thông báo trạng thái rõ ràng bằng tiếng Việt",
      "data": { ... }
    }
    ```
  * Sử dụng đúng HTTP Status Codes:
    * `200 OK`: Xử lý thành công hoặc trả về luồng file báo cáo (`.xlsx`).
    * `400 Bad Request`: Thiếu tham số bắt buộc hoặc dữ liệu đầu vào không hợp lệ.
    * `401 Unauthorized`: Chưa đăng nhập, sai mật khẩu hoặc JWT Token hết hạn.
    * `403 Forbidden`: Vi phạm quyền truy cập chéo cơ sở (IDOR giữa các `facility_id`) hoặc truy cập đường dẫn bị cấm.
    * `404 Not Found`: Không tìm thấy tài nguyên hoặc mã CN Code/hồ sơ nhà cung cấp.
    * `429 Too Many Requests`: Vượt ngưỡng giới hạn đăng nhập sai hoặc spam biểu mẫu khảo sát.
    * `500 Internal Server Error`: Lỗi hệ thống máy chủ hoặc thiếu cấu hình biến môi trường bắt buộc trên Production.

---

## 3. VÒNG ĐỜI PHÁT TRIỂN, KIỂM THỬ & BẢO MẬT MÔI TRƯỜNG (DevSecOps Lifecycle)

### 3.1. Quy trình 6 Bước Phát triển & Kiểm chứng
```text
[1. Đặc tả Nghiệp vụ KNK/CBAM] ➔ [2. Chuẩn hóa Hệ số EF_MASTER] ➔ [3. Lập trình Module] 
       ➔ [4. Kiểm thử Tự động Đa tầng] ➔ [5. Kiểm tra Bảo mật Fail-Fast] ➔ [6. Đồng bộ & Triển khai]
```
* **Quản lý Biến môi trường & Cơ chế Fail-Fast (`server/app.py`):**
  * Tuyệt đối không commit file `.env` chứa khóa bí mật lên Git.
  * Khi `ENVIRONMENT=production`, hệ thống bắt buộc kiểm tra **Fail-Fast**: từ chối khởi động nếu `GREENSHIFT_JWT_SECRET`, `GREENSHIFT_ADMIN_USER`, `GREENSHIFT_ADMIN_PASS` hoặc `GREENSHIFT_FACILITY_PASS` chưa được thiết lập hoặc vẫn để giá trị mặc định (`1234`).
* **Kiểm thử Đa tầng Tự động (`tests/`):**
  * Mọi thay đổi mã nguồn phải vượt qua toàn bộ bộ kiểm thử Node.js (`node tests/run_all_tests.js` — hơn 45 kịch bản kiểm thử chuyên biệt) và bộ kiểm thử Python (`tests/test_api_endpoints.py`, `tests/test_audit_remediation_v3.py`).
  * Kiểm tra tính toàn vẹn liên kết nội bộ bằng `node tests/verify_all_links.js` (0 liên kết gãy).

---

## 4. QUY ƯỚC TRẢI NGHIỆM NGƯỜI DÙNG, KHẢ NĂNG TIẾP CẬN & HIỆU NĂNG (UX, a11y & Core Web Vitals)

### 4.1. Bố cục Phân tách Vai trò (Role-Isolated Workspace)
* **Tách biệt luồng thao tác giữa Kế toán (Accountant) và Kỹ sư vận hành (Engineer):**
  * **Kế toán:** Tập trung vào nhập/bóc tách hóa đơn năng lượng mua ngoài cấp cơ sở (Điện EVN, Dầu DO, Xăng, LPG, Than, Sinh khối) kèm chứng từ gốc.
  * **Kỹ sư vận hành:** Tập trung vào nhật ký vận hành máy móc thiết bị, công suất định mức, thời gian ngừng máy bảo dưỡng (Downtime) và sản lượng thực tế.
  * **Bảng Đối soát Chéo (Reconciliation Card):** Tự động so sánh chênh lệch giữa Hóa đơn Kế toán và Nhật ký Kỹ sư, hiển thị cảnh báo màu sắc trực quan theo ngưỡng dung sai.

### 4.2. Tư duy Đáp ứng Đa màn hình (Responsive Breakpoints)
* Khống chế độ rộng vùng nội dung chuẩn (`1200px - 1440px`), tự động ẩn các thẻ nổi trang trí (`@media (max-width: 1360px)`) trên màn hình Laptop nhỏ để tránh đè chữ.
* Trên bảng dữ liệu lớn (`#activity-table-card`, `#machine-overview-table-container`), cung cấp nút **Thu gọn / Mở rộng chiều cao bảng** và bộ lọc có cơ chế **Debounce (150ms)** để giữ giao diện luôn mượt mà.

### 4.3. Tiêu chuẩn Khả năng Tiếp cận (Accessibility - WCAG 2.1 AA) & Hiệu năng
* Mọi thẻ `<img>` bắt buộc có thuộc tính `alt`; các hình ảnh ở phần chân trang (below-the-fold) gắn `loading="lazy" decoding="async"`.
* Các nút hoặc liên kết chỉ chứa biểu tượng SVG bắt buộc có thuộc tính `aria-label` rõ nghĩa.
* **Chống trang cụt (Zero Dead-Ends):** Khi người dùng truy cập nhầm đường dẫn không tồn tại trên trình duyệt, máy chủ trả về trang HTML 404 thân thiện kèm nút **"Quay lại Trang chủ"** và **"Bảng Kiểm kê KNK"** thay vì chuỗi lỗi JSON thô.

---

## 5. QUY ƯỚC TOÀN VẸN DỮ LIỆU KIỂM KÊ KNK & BÁO CÁO THUẾ CARBON (GHG & EU CBAM AUDIT INTEGRITY)

Đây là bộ quy tắc nghiệp vụ cốt lõi bắt buộc tuân thủ trong toàn bộ mã nguồn GreenShift để đảm bảo báo cáo đạt chuẩn thẩm định độc lập **ISO 14064-3**:

### 5.1. Nguồn Hệ số Phát thải Duy nhất (Single Source of Truth)
* Toàn bộ hệ số phát thải quốc gia (QĐ 2626/QĐ-BTNMT, Công văn 263/BĐKH) và quốc tế (IPCC 2006/2019, GHG Protocol, EU CBAM Regulation 2023/1773) được quản lý tập trung tại **`assets/js/ef-master.js` (`window.EF_MASTER`)**.
* Các module vệ tinh (`assets/js/calculator.js`, `assets/js/invoice-parser.js`, `assets/js/carbon-activity.js`, `assets/js/supabase-client.js`) bắt buộc tra cứu hệ số thông qua `EF_MASTER`, tuyệt đối không hardcode hệ số lệch chuẩn.
* **Phân biệt nghiêm ngặt hệ số điện lưới Việt Nam:**
  * Kiểm kê KNK cấp cơ sở nội địa (Nghị định 06/2022/NĐ-CP): **`0.6766` $\text{tCO}_2\text{e/MWh}$** (QĐ 2626/QĐ-BTNMT).
  * Báo cáo xuất khẩu EU CBAM mặc định: **`0.7221` $\text{tCO}_2\text{e/MWh}$** (Công văn 263/BĐKH-TTBĐKH).

### 5.2. Tách biệt Phát thải Sinh học (Biogenic $\text{CO}_2$ Isolation)
* Đối với nhiên liệu sinh khối (Củi, dăm gỗ, mùn cưa, viên nén, trấu, biogas):
  * **Chỉ tính phát thải $\text{CH}_4$ và $\text{N}_2\text{O}$** (quy đổi theo GWP) vào tổng phát thải **Phạm vi 1 (Scope 1)**.
  * **Lượng $\text{CO}_2$ sinh học (`biogenicCo2`)** bắt buộc phải được tính riêng và báo cáo ở mục độc lập ngoài Scope 1 theo đúng chuẩn ISO 14064-1 và GHG Protocol.

### 5.3. Phân rã Khí Nhà Kính & Quy tắc Làm tròn Số học
* Khi tổng hợp báo cáo kiểm kê năm đẩy lên cơ sở dữ liệu (`inventory_reports`), phát thải đốt nhiên liệu Phạm vi 1 phải được phân rã đầy đủ thành 3 loại khí: **$\text{CO}_2$ (`co2_mass_ton`)**, **$\text{CH}_4$ (`ch4_mass_ton`, `ch4_converted_tco2e`)** và **$\text{N}_2\text{O}$ (`n2o_mass_ton`, `n2o_converted_tco2e`)** dựa trên nhiệt trị ròng (NCV) và hệ số `ef_co2_tj`, `ef_ch4_tj`, `ef_n2o_tj` trong `EF_MASTER`.
* **Quy tắc xử lý số liệu (`parse_num` & `normalizeQuantity`):**
  * Hỗ trợ chuẩn xác cả định dạng số Việt Nam/Châu Âu (`1.234.567,89`), định dạng Quốc tế (`1,234,567.89`), khoảng trắng Unicode (`\u00a0`, `\u202f`) và số âm kế toán trong ngoặc đơn `(1.234,56)`.
  * Giữ nguyên độ chính xác dấu phẩy động trong toàn bộ các bước tính trung gian; chỉ làm tròn `4` chữ số thập phân đối với suất phát thải riêng CBAM (`SEE`) và `2` chữ số thập phân khi hiển thị tổng lượng phát thải trên giao diện.

### 5.4. Cô lập Đa cơ sở (Multi-Tenant Isolation) & Vết Kiểm toán Bất biến (Audit Trail)
* Mọi thao tác đọc/ghi dữ liệu trên Cloud (`facilities`, `activities`, `inventory_reports`, `cbam_dossiers`) và API xuất báo cáo (`/api/generate-report`, `/api/generate-internal-report`) bắt buộc gắn chặt với `facility_id` của người dùng đang đăng nhập (`requireFacilityId()`), nghiêm cấm ghi đè chéo giữa các nhà máy.
* Mọi hồ sơ CBAM khi chốt sổ (`pushCbamDossier`) phải được tạo mã băm toàn vẹn xác định (`computeDeterministicHash`) và ghi nhận lịch sử thay đổi vào bảng `audit_logs` kèm dấu thời gian ISO 8601.
