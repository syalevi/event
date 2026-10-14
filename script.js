/* =========================================================
   script.js - Logika form pendaftaran seminar Ev-Parmad
   Alur:
   1. Ambil elemen HTML yang dibutuhkan
   2. Fungsi bantu (format Rupiah, hitung total)
   3. Validasi form
   4. Simpan pendaftaran ke localStorage
   5. Tampilkan daftar peserta
   6. Pasang event listener
   ========================================================= */


/* ---------- 1. ELEMEN & DATA ---------- */

const BIAYA_ADMIN = 5000;
const KUOTA_AWAL = 100;
const KUNCI_PENYIMPANAN = 'pendaftar_evparmad';   // nama kunci di localStorage

const form = document.getElementById('formDaftar');
const inputNama = document.getElementById('nama');
const inputInstansi = document.getElementById('instansi');
const inputEmail = document.getElementById('email');
const inputTelepon = document.getElementById('telepon');
const selectTiket = document.getElementById('jenisTiket');
const inputJumlah = document.getElementById('jumlah');
const checkSetuju = document.getElementById('setuju');

// Data peserta dibaca dari localStorage; jika belum ada, pakai array kosong
let daftarPendaftar = JSON.parse(localStorage.getItem(KUNCI_PENYIMPANAN) || '[]');


/* ---------- 2. FUNGSI BANTU ---------- */

// Mengubah angka 100000 menjadi "Rp 100.000"
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Mengambil jumlah tiket yang valid (1 sampai 5)
function ambilJumlah() {
    const jumlah = parseInt(inputJumlah.value, 10);
    if (isNaN(jumlah) || jumlah < 1) return 1;
    if (jumlah > 5) return 5;
    return jumlah;
}

// Menghitung dan menampilkan ringkasan biaya
function hitungTotal() {
    const harga = parseInt(selectTiket.value, 10);
    const jumlah = ambilJumlah();
    const subtotal = harga * jumlah;

    document.getElementById('ringkasJumlah').textContent = jumlah;
    document.getElementById('ringkasSubtotal').textContent = formatRupiah(subtotal);
    document.getElementById('ringkasAdmin').textContent = formatRupiah(BIAYA_ADMIN);
    document.getElementById('ringkasTotal').textContent = formatRupiah(subtotal + BIAYA_ADMIN);

    return subtotal + BIAYA_ADMIN;
}

// Membuat kode pendaftaran acak, contoh: PRM-K3F9Q
function buatKode() {
    return 'PRM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

// Menghitung sisa kuota dan menampilkannya di halaman
function perbaruiKuota() {
    let terpakai = 0;
    daftarPendaftar.forEach(function (p) {
        terpakai += p.jumlah;
    });
    document.getElementById('sisaKuota').textContent = Math.max(0, KUOTA_AWAL - terpakai);
}


/* ---------- 3. VALIDASI ---------- */

// Menampilkan atau menghapus pesan error di bawah sebuah kolom
function tampilkanError(input, idError, pesan) {
    document.getElementById(idError).textContent = pesan;
    if (input) {
        input.classList.toggle('input-error', pesan !== '');
    }
}

// Mengembalikan true jika semua isian benar
function validasiForm() {
    let valid = true;

    // Nama: tidak boleh kosong, minimal 3 huruf
    if (inputNama.value.trim().length < 3) {
        tampilkanError(inputNama, 'errorNama', 'Nama minimal 3 karakter.');
        valid = false;
    } else {
        tampilkanError(inputNama, 'errorNama', '');
    }

    // Instansi: tidak boleh kosong, minimal 2 huruf
    if (inputInstansi.value.trim().length < 2) {
        tampilkanError(inputInstansi, 'errorInstansi', 'Instansi / kampus wajib diisi.');
        valid = false;
    } else {
        tampilkanError(inputInstansi, 'errorInstansi', '');
    }

    // Email: dicek dengan pola sederhana (ada @ dan titik)
    const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!polaEmail.test(inputEmail.value.trim())) {
        tampilkanError(inputEmail, 'errorEmail', 'Format email tidak valid.');
        valid = false;
    } else {
        tampilkanError(inputEmail, 'errorEmail', '');
    }

    // Telepon: hanya angka, 10 sampai 13 digit
    const polaTelepon = /^[0-9]{10,13}$/;
    if (!polaTelepon.test(inputTelepon.value.trim())) {
        tampilkanError(inputTelepon, 'errorTelepon', 'Nomor harus 10-13 digit angka.');
        valid = false;
    } else {
        tampilkanError(inputTelepon, 'errorTelepon', '');
    }

    // Jumlah tiket: 1 sampai 5
    const jumlah = parseInt(inputJumlah.value, 10);
    if (isNaN(jumlah) || jumlah < 1 || jumlah > 5) {
        tampilkanError(inputJumlah, 'errorJumlah', 'Jumlah tiket harus 1 sampai 5.');
        valid = false;
    } else {
        tampilkanError(inputJumlah, 'errorJumlah', '');
    }

    // Persetujuan wajib dicentang
    if (!checkSetuju.checked) {
        tampilkanError(null, 'errorSetuju', 'Anda harus menyetujui syarat & ketentuan.');
        valid = false;
    } else {
        tampilkanError(null, 'errorSetuju', '');
    }

    return valid;
}


/* ---------- 4. SIMPAN PENDAFTARAN ---------- */

function simpanPendaftar() {
    // Teks pilihan tiket, contoh: "Umum (hadir langsung)"
    const namaTiket = selectTiket.options[selectTiket.selectedIndex].text.split(' - ')[0];

    const pendaftar = {
        kode: buatKode(),
        nama: inputNama.value.trim(),
        instansi: inputInstansi.value.trim(),
        email: inputEmail.value.trim(),
        telepon: inputTelepon.value.trim(),
        tiket: namaTiket,
        jumlah: ambilJumlah(),
        total: hitungTotal()
    };

    daftarPendaftar.push(pendaftar);
    localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarPendaftar));

    return pendaftar;
}


/* ---------- 5. TAMPILKAN DAFTAR PESERTA ---------- */

function tampilkanDaftar() {
    const tabel = document.getElementById('tabelPendaftar');
    const isiTabel = document.getElementById('isiTabel');
    const pesanKosong = document.getElementById('pesanKosong');

    isiTabel.innerHTML = '';

    if (daftarPendaftar.length === 0) {
        tabel.classList.add('hidden');
        pesanKosong.classList.remove('hidden');
        return;
    }

    tabel.classList.remove('hidden');
    pesanKosong.classList.add('hidden');

    daftarPendaftar.forEach(function (p) {
        // textContent dipakai agar isi data tidak dibaca sebagai HTML (lebih aman)
        const baris = document.createElement('tr');
        [p.kode, p.nama, p.instansi, p.tiket, p.jumlah, formatRupiah(p.total)].forEach(function (isi) {
            const sel = document.createElement('td');
            sel.textContent = isi;
            baris.appendChild(sel);
        });
        isiTabel.appendChild(baris);
    });
}


/* ---------- 6. EVENT LISTENER ---------- */

// Hitung ulang total setiap kali tiket atau jumlah berubah
selectTiket.addEventListener('change', hitungTotal);
inputJumlah.addEventListener('input', hitungTotal);

// Saat form dikirim
form.addEventListener('submit', function (event) {
    event.preventDefault();          // cegah halaman reload

    if (!validasiForm()) return;     // berhenti jika ada isian yang salah

    const pendaftar = simpanPendaftar();

    // Tampilkan pesan sukses
    const pesan = document.getElementById('pesanSukses');
    pesan.textContent = 'Pendaftaran berhasil! Kode Anda: ' + pendaftar.kode +
                        ' (Total ' + formatRupiah(pendaftar.total) + ')';
    pesan.classList.remove('hidden');

    // Kosongkan form, lalu perbarui tampilan
    form.reset();
    hitungTotal();
    tampilkanDaftar();
    perbaruiKuota();
});

// Tombol hapus semua data peserta
document.getElementById('tombolHapus').addEventListener('click', function () {
    if (!confirm('Hapus semua data peserta?')) return;

    daftarPendaftar = [];
    localStorage.removeItem(KUNCI_PENYIMPANAN);
    document.getElementById('pesanSukses').classList.add('hidden');
    tampilkanDaftar();
    perbaruiKuota();
});

// Jalankan saat halaman pertama kali dibuka
hitungTotal();
tampilkanDaftar();
perbaruiKuota();
