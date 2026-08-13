const statusEl = document.getElementById('status');
const coordsEl = document.getElementById('coords');
const latEl = document.getElementById('lat');
const lngEl = document.getElementById('lng');
const mapsLinkEl = document.getElementById('mapsLink');
const retryBtn = document.getElementById('retryBtn');
const manualFallback = document.getElementById('manualFallback');
const manualLatInput = document.getElementById('manualLat');
const manualLngInput = document.getElementById('manualLng');
const manualApplyBtn = document.getElementById('manualApplyBtn');
const descriptionEl = document.getElementById('description');
const generateBtn = document.getElementById('generateBtn');
const previewSection = document.getElementById('previewSection');
const qrCanvas = document.getElementById('qrCanvas');
const downloadBtn = document.getElementById('downloadBtn');

let currentLocation = null;

function buildMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function setLocation(lat, lng) {
  currentLocation = { lat, lng };
  latEl.textContent = lat.toFixed(6);
  lngEl.textContent = lng.toFixed(6);
  coordsEl.hidden = false;
  mapsLinkEl.href = buildMapsUrl(lat, lng);
  mapsLinkEl.hidden = false;
  statusEl.textContent = '位置情報を取得しました';
  retryBtn.hidden = false;
  manualFallback.hidden = true;
  generateBtn.disabled = false;
  previewSection.hidden = true;
  prefillDescriptionFromAddress(lat, lng);
}

async function prefillDescriptionFromAddress(lat, lng) {
  if (descriptionEl.value.trim() !== '') return;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=ja`
    );
    if (!res.ok) return;
    const data = await res.json();
    const a = data.address || {};
    const area = a.city || a.town || a.village || a.county || '';
    const district = a.city_district || a.suburb || a.neighbourhood || '';
    const partial = [a.state, area, district].filter(Boolean).join('');
    if (partial && descriptionEl.value.trim() === '') {
      descriptionEl.value = partial;
    }
  } catch {
    // 住所取得に失敗しても説明欄は空のままでよい
  }
}

function requestLocation() {
  statusEl.textContent = '位置情報を取得中...';
  retryBtn.hidden = true;
  manualFallback.hidden = true;
  generateBtn.disabled = true;

  if (!navigator.geolocation) {
    statusEl.textContent = 'このブラウザは位置情報取得に対応していません。';
    manualFallback.hidden = false;
    retryBtn.hidden = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => setLocation(pos.coords.latitude, pos.coords.longitude),
    () => {
      statusEl.textContent = '位置情報を取得できませんでした。';
      manualFallback.hidden = false;
      retryBtn.hidden = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split('\n');
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }
    let line = '';
    for (const ch of paragraph) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line !== '') lines.push(line);
  }
  return lines;
}

async function generateQr() {
  if (!currentLocation) return;

  const mapsUrl = buildMapsUrl(currentLocation.lat, currentLocation.lng);
  const description = descriptionEl.value.trim();

  const targetQrSize = 320;
  const qr = qrcode(0, 'M');
  qr.addData(mapsUrl);
  qr.make();
  const moduleCount = qr.getModuleCount();
  const cellSize = Math.max(1, Math.floor(targetQrSize / moduleCount));
  const qrSize = cellSize * moduleCount;

  const qrSource = document.createElement('canvas');
  qrSource.width = qrSize;
  qrSource.height = qrSize;
  const qrCtx = qrSource.getContext('2d');
  qrCtx.fillStyle = '#ffffff';
  qrCtx.fillRect(0, 0, qrSize, qrSize);
  qrCtx.fillStyle = '#000000';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        qrCtx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  const padding = 24;
  const font = '22px sans-serif';
  const lineHeight = 30;
  const measureCtx = qrCanvas.getContext('2d');
  measureCtx.font = font;

  const textMaxWidth = qrSize;
  const descLines = description ? wrapText(measureCtx, description, textMaxWidth) : [];
  const textBlockHeight = descLines.length ? descLines.length * lineHeight : 0;

  qrCanvas.width = qrSize + padding * 2;
  qrCanvas.height = qrSize + padding * 2 + textBlockHeight + (descLines.length ? padding : 0);

  const ctx = qrCanvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
  ctx.drawImage(qrSource, padding, padding);

  ctx.fillStyle = '#1c1e21';
  ctx.font = font;
  ctx.textBaseline = 'top';

  let y = padding + qrSize + padding;
  for (const line of descLines) {
    ctx.fillText(line, padding, y);
    y += lineHeight;
  }

  previewSection.hidden = false;
}

function downloadQr() {
  const link = document.createElement('a');
  link.download = `location-qr-${Date.now()}.png`;
  link.href = qrCanvas.toDataURL('image/png');
  link.click();
}

retryBtn.addEventListener('click', requestLocation);
manualApplyBtn.addEventListener('click', () => {
  const lat = parseFloat(manualLatInput.value);
  const lng = parseFloat(manualLngInput.value);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    alert('緯度・経度を正しく入力してください。');
    return;
  }
  setLocation(lat, lng);
});
generateBtn.addEventListener('click', generateQr);
downloadBtn.addEventListener('click', downloadQr);

requestLocation();
