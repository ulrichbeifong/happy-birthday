# Birthday Blow Candle Web

Web chúc mừng sinh nhật dùng React + Vite.

## Chức năng chính

- Bánh sinh nhật + nến có lửa động.
- Bấm "Bắt đầu thổi" để bật camera và micro.
- Dùng micro phát hiện tiếng thổi.
- Thổi 1 lần tắt toàn bộ nến.
- Hiệu ứng khói, confetti, pháo hoa.
- Thiệp chúc mừng.
- Gallery ảnh kỷ niệm.
- Bức tường lời chúc.
- Game phiêu lưu nhặt quà.
- Mode chụp ảnh kỷ niệm và lưu ảnh về máy.

## Cài đặt

```powershell
npm install
npm run dev
```

Mở:

```txt
http://localhost:5173/
```

## Lưu ý

- Camera/micro thường cần chạy trên `localhost` hoặc HTTPS.
- Nếu muốn thêm nhạc/ảnh thật, thay file trong `public/audio`, `public/images`, `public/stickers`.
- Nếu file audio đang trống thì nút nhạc có thể không phát được. Chỉ cần thay bằng file `.mp3` thật.
