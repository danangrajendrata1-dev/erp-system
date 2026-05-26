export function parseUkuranMm(size: string) {
  if (!size) {
    return {
      lebarMm: 0,
      panjangMm: 0,
    };
  }

  const normalized = size
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("mm", "")
    .replaceAll("*", "x");

  const parts = normalized.split("x");

  if (parts.length < 2) {
    return {
      lebarMm: 0,
      panjangMm: 0,
    };
  }

  return {
    lebarMm: Number(parts[0]) || 0,
    panjangMm: Number(parts[1]) || 0,
  };
}

export function hitungKepingPerRim(params: {
  lebarOrderMm: number;
  panjangOrderMm: number;
  lebarBahanCm: number;
  panjangBahanCm: number;
}) {
  const { lebarOrderMm, panjangOrderMm, lebarBahanCm, panjangBahanCm } = params;

  if (
    lebarOrderMm <= 0 ||
    panjangOrderMm <= 0 ||
    lebarBahanCm <= 0 ||
    panjangBahanCm <= 0
  ) {
    return {
      keping: 0,
      lajur: 0,
      kepingPerLembar: 0,
      kepingPerRim: 0,
    };
  }

  const lebarBahanMm = lebarBahanCm * 10;
  const panjangBahanMm = panjangBahanCm * 10;

  const keping = Math.floor(lebarBahanMm / lebarOrderMm);
  const lajur = Math.floor(panjangBahanMm / panjangOrderMm);

  const kepingPerLembar = keping * lajur;
  const kepingPerRim = kepingPerLembar * 500;

  return {
    keping,
    lajur,
    kepingPerLembar,
    kepingPerRim,
  };
}

export function hitungKepingDariRim(params: {
  rim: number;
  lebarOrderMm: number;
  panjangOrderMm: number;
  lebarBahanCm: number;
  panjangBahanCm: number;
}) {
  const hasil = hitungKepingPerRim(params);

  return {
    ...hasil,
    totalKeping: params.rim * hasil.kepingPerRim,
  };
}

export function hitungRimDariKeping(params: {
  totalKeping: number;
  lebarOrderMm: number;
  panjangOrderMm: number;
  lebarBahanCm: number;
  panjangBahanCm: number;
}) {
  const hasil = hitungKepingPerRim(params);

  return {
    ...hasil,
    totalRim:
      hasil.kepingPerRim > 0
        ? params.totalKeping / hasil.kepingPerRim
        : 0,
  };
}