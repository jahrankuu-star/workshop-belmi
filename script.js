// ===== Ambil elemen DOM =====
const form = document.getElementById("formDaftar");
const pesanError = document.getElementById("pesanError");
const hasil = document.getElementById("hasil");

// ===== Fungsi bantu =====
function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

// Business logic: persentase diskon berdasarkan digit terakhir NIM
// Ganjil -> berdasarkan jumlah peserta
// Genap  -> berdasarkan subtotal
// Jika memenuhi lebih dari satu ambang, diskon tertinggi dipakai
// (dicek dari ambang terbesar ke terkecil).
function hitungPersenDiskon(nim, jumlah, subtotal) {
  const digitTerakhir = parseInt(nim.charAt(nim.length - 1), 10);
  let persen = 0;

  if (digitTerakhir % 2 !== 0) {
    // NIM ganjil
    if (jumlah >= 5) {
      persen = 15;
    } else if (jumlah >= 3) {
      persen = 10;
    } else {
      persen = 0;
    }
  } else {
    // NIM genap
    if (subtotal >= 500000) {
      persen = 15;
    } else if (subtotal >= 250000) {
      persen = 5;
    } else {
      persen = 0;
    }
  }

  return persen;
}

function hitungPendaftaran(nim, biaya, jumlah) {
  const subtotal = biaya * jumlah;
  const persen = hitungPersenDiskon(nim, jumlah, subtotal);
  const diskon = subtotal * persen / 100;
  const total = subtotal - diskon;
  return { subtotal, persen, diskon, total };
}

function validasiEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tampilkanError(daftarError) {
  const item = daftarError.map(function (e) {
    return "<li>" + e + "</li>";
  }).join("");
  pesanError.innerHTML = "<ul>" + item + "</ul>";
  pesanError.hidden = false;
  hasil.hidden = true;
}

// ===== Event handling =====
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const nim = document.getElementById("nim").value.trim();
  const prodi = document.getElementById("prodi").value;
  const email = document.getElementById("email").value.trim();
  const selectWorkshop = document.getElementById("workshop");
  const workshop = selectWorkshop.value;
  const jumlah = parseInt(document.getElementById("jumlah").value, 10);

  // ----- Validasi -----
  const errors = [];

  if (nama === "") {
    errors.push("Nama tidak boleh kosong.");
  }
  if (nim === "") {
    errors.push("NIM tidak boleh kosong.");
  } else if (!/^\d+$/.test(nim)) {
    errors.push("NIM hanya boleh berisi angka.");
  }
  if (prodi === "") {
    errors.push("Program studi harus dipilih.");
  }
  if (!validasiEmail(email)) {
    errors.push("Format email tidak valid.");
  }
  if (workshop === "") {
    errors.push("Workshop harus dipilih.");
  }
  if (isNaN(jumlah) || jumlah < 1) {
    errors.push("Jumlah peserta minimal 1.");
  }

  if (errors.length > 0) {
    tampilkanError(errors);
    return;
  }

  // ----- Perhitungan -----
  pesanError.hidden = true;
  const biaya = parseInt(selectWorkshop.selectedOptions[0].dataset.harga, 10);
  const r = hitungPendaftaran(nim, biaya, jumlah);

  // ----- Output -----
  document.getElementById("outNama").textContent = nama;
  document.getElementById("outNim").textContent = nim;
  document.getElementById("outProdi").textContent = prodi;
  document.getElementById("outWorkshop").textContent = workshop;
  document.getElementById("outJumlah").textContent = jumlah;
  document.getElementById("outSubtotal").textContent = formatRupiah(r.subtotal);
  document.getElementById("outDiskon").textContent =
    r.persen + "% (" + formatRupiah(r.diskon) + ")";
  document.getElementById("outTotal").textContent = formatRupiah(r.total);

  hasil.hidden = false;
  hasil.scrollIntoView({ behavior: "smooth" });
});