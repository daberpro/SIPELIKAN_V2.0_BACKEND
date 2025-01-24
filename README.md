# # SIPELIKAN BACKEND
## VERSION 2.0

Repositori ini merupakan repositori dari aplikasi dan web sipelikan versi 2.0 \
adapun module - module atau packages yang digunakan pada repositori ini yaitu
1. Express
2. jsonwebtoken
3. Prisma ORM
4. nodemon (development only)
5. express-validator
6. bcrypt
database yang digunakan pada project ini yaitu `MySql`
> Note \
> web server pada repositori ini menggunakan sistem \
> token base authentication yang di buat menggunakan jwt

### # Konfigurasi
project ini memuat konfigurasi yang disimpan dalam file `.env` yang berisi contoh konfigurasi sebagai berikut
```env
PORT=4300
COOKIE_SECRET=
JWT_SECRET=
DATABASE_URL="mysql://root@localhost:3306/sipelikan?connection_limit=30"
```

### # Instalasi dan penggunaan
untuk menjalankan project ini pada local device silahkan clone repositori ini \
kemudian silahkan buka `cmd` pada folder yang telah di clone dan install semua dependencies yang dibutuhkn dengam menjalan perintah berikut 
```bash
npm install
```
setelah instalasi selesai silahkan jalankan perintah
```bash
npm run dev
```
kemudian silahkan migrasi database dengan menggunakan prisma melalui command berikut
```bash
npx prisma migrate dev --name "{description}"
```
dimana `{description}` merupakan deskripsi terkini mengenai migrasi yang dilakukan

### Dokumentasi API
[Dokumntasi Endpoint API Sipelikan V2.0](https://documenter.getpostman.com/view/41333421/2sAYQdjVpp)

## UPDATE 25/01/2025
#### New Role
penambahan route dan schema pada user untuk membuat akun dengan tiga rule yaitu
- ADMIN
- USER
- OPERATOR
dengan akun yang memiliki akses tertinggi yaitu akun ADMIn yang dapat mengubah atau mengedit role pada akun OPERATOR/USER
#### Password Generator
akun ADMIN hanya bisa di masukan secara langsung memalui query ke database tanpa melalui antarmuka web
untuk membuat password yang di encode untuk admin jalankan perintah berikut
```bash
npm run hash:password
```
kemudian silahkan copas hasil encode dan simpan sebagai password pada admin
