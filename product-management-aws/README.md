# Quản Lý Sản Phẩm - Node.js + AWS

Dự án triển khai mô hình MVC theo yêu cầu sử dụng EJS, DynamoDB và Amazon S3.

## 1. Yêu cầu hệ thống
- Node.js (v18 trở lên khuyến nghị)
- Môi trường đã cài đặt AWS Credentials hoặc sử dụng file `.env`. (Cần Region, S3 Bucket có quyền upload, DynamoDB có bảng `Products`).

## 2. Cài đặt và Khởi chạy

1. **Cài đặt thư viện NPM:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   - Đổi tên file `.env.example` thành `.env`
   - Nhập thông tin AWS của bạn vào file `.env`.
   - Lưu ý: Đảm bảo bảng `Products` đã tồn tại trong DynamoDB (với khóa chính là `ID` kiểu Chuỗi / String).

3. **Chạy Server:**
   ```bash
   node app.js
   ```

4. **Truy cập Giao diện Trình duyệt:**
   [http://localhost:3000](http://localhost:3000)

## 3. Các tính năng nổi bật
- Giao diện UI/UX trực quan, hiện đại bằng Bootstrap & Custom CSS.
- Đầy đủ chức năng CRUD (Thêm, Xóa, Sửa, Lọc Danh sách).
- Tích hợp S3 Middleware cho ảnh, hỗ trợ xem trước khi tải lên.
- Có tính năng nâng cao: Xóa ảnh cũ trên S3 thay vì để lại file rác, Tìm kiếm bằng chuỗi gần đúng (Fuzzy query).

## 4. Cấu trúc Thư mục
- `/config`: Thiết lập AWS S3, thiết lập Client DynamoDB.
- `/controllers`: Lớp business logic và data passing.
- `/models`: Lớp tương tác DynamoDB API.
- `/routes`: Các router path cho sản phẩm.
- `/views`: Các template EJS hiển thị nội dung.
- `/public`: CSS và assets công cộng.
