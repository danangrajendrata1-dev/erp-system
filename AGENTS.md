# Panduan untuk Codex

Project ini adalah aplikasi ERP berbasis frontend dan backend.

Aturan penting:
- Jangan mengubah struktur besar project tanpa izin.
- Jangan menghapus file yang sudah ada.
- Jangan mengganti nama route, model, schema, atau service tanpa alasan jelas.
- Ikuti alur ERP sesuai file Excel referensi:
  1. BKorder
  2. Sales 103
  3. BKPt
  4. Invoice 103
- Tampilan input harus mengikuti file Excel referensi semirip mungkin.
- Gunakan environment variable, jangan hardcode URL API atau database.
- Project harus bisa berjalan online untuk demo dan offline di server lokal LAN.
- Backend, frontend, dan database PostgreSQL harus tetap bisa dipisahkan konfigurasinya.

Sebelum mengedit:
1. Baca struktur file.
2. Jelaskan file mana yang akan diubah.
3. Beri perubahan bertahap.
4. Jangan ubah banyak bagian sekaligus.