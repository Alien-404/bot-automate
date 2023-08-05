# Panduan Penggunaan Node.js

Ini adalah panduan lengkap tentang cara menggunakan Node.js untuk menginstal modul, menjalankan skrip, dan melakukan konfigurasi akun menggunakan flag-flag yang disediakan.

## Instalasi Modul

1. Buka terminal atau command prompt.
2. Arahkan ke direktori proyek Anda.
3. Jalankan perintah berikut untuk menginstal modul-modul yang diperlukan:

   ```sh
   npm install
   ```

## Menjalankan Skrip

Untuk menjalankan skrip menggunakan Node.js, lakukan langkah berikut:

1. Buka terminal atau command prompt.
2. Arahkan ke direktori proyek Anda.
3. Jalankan perintah berikut:

   ```sh
   npm start
   ```

Ini akan menjalankan skrip yang disebut `index.js`.

## Memeriksa Konfigurasi Akun

Untuk memeriksa apakah konfigurasi akun sudah terisi, gunakan perintah berikut:

```sh
npm run check
```

## Melakukan Konfigurasi Akun

Untuk melakukan konfigurasi akun, gunakan perintah berikut:

```sh
npm run setup
```

## Konfigurasi Satu Per Satu

Jika Anda ingin mengkonfigurasi akun satu per satu dengan flag-flag tertentu, gunakan perintah berikut:

```sh
node ./config/single -e <email> -p <password> -c <comment> -g <group_url>
```

Gantilah email, password, comment, dan group_url dengan nilai yang sesuai. (note bisa satu argumnet saja yang diganti)
