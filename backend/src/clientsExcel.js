const ExcelJS = require("exceljs");

const COLUMNS = [
  { header: "Correo", key: "email", width: 34 },
  { header: "Nombre", key: "name", width: 26 },
  { header: "Teléfono", key: "phone", width: 18 },
  { header: "Origen", key: "source", width: 16 },
  { header: "Fecha de alta", key: "createdAt", width: 20 },
  { header: "Suscrito", key: "subscribed", width: 10 },
  { header: "Último correo", key: "lastEmailAt", width: 20 },
  { header: "Próximo seguimiento", key: "nextFollowupAt", width: 20 },
  { header: "Seguimientos", key: "followupCount", width: 13 },
  { header: "Notas", key: "notes", width: 30 },
];

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "short" }) : "");

const buildClientsWorkbook = async (clients) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Okume Karaoke";
  const sheet = workbook.addWorksheet("Clientes", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true, color: { argb: "FFF8EFD2" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF29493A" } };
  sheet.getRow(1).height = 22;
  for (const c of clients) {
    sheet.addRow({
      email: c.email, name: c.name || "", phone: c.phone || "", source: c.source || "", createdAt: formatDate(c.createdAt),
      subscribed: c.subscribed === false ? "No" : "Sí", lastEmailAt: formatDate(c.lastEmailAt), nextFollowupAt: c.subscribed === false ? "" : formatDate(c.nextFollowupAt),
      followupCount: c.followupCount || 0, notes: c.notes || "",
    });
  }
  sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + COLUMNS.length)}1` };
  return Buffer.from(await workbook.xlsx.writeBuffer());
};

const normalizeHeader = (value) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const detectKey = (header) => {
  const h = normalizeHeader(header);
  if (!h) return null;
  if (/correo|e-?mail|mail/.test(h)) return "email";
  if (/nombre|name/.test(h)) return "name";
  if (/tel|phone|movil|celular|whatsapp/.test(h)) return "phone";
  if (/origen|source/.test(h)) return "source";
  if (/suscri|subscri|activo/.test(h)) return "subscribed";
  if (/nota|comentario|notes/.test(h)) return "notes";
  return null;
};

const cellText = (cell) => {
  const v = cell?.value;
  if (v == null) return "";
  if (typeof v === "object") return String(v.text || (Array.isArray(v.richText) ? v.richText.map((r) => r.text).join("") : "") || v.result || "").trim();
  return String(v).trim();
};

const parseClientsWorkbook = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const headerRow = sheet.getRow(1);
  const mapping = {};
  headerRow.eachCell((cell, col) => { const key = detectKey(cellText(cell)); if (key && !Object.values(mapping).includes(key)) mapping[col] = key; });
  const hasHeader = Object.values(mapping).includes("email");
  if (!hasHeader) mapping[1] = "email";
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (hasHeader && rowNumber === 1) return;
    const record = {};
    Object.entries(mapping).forEach(([col, key]) => { record[key] = cellText(row.getCell(Number(col))); });
    if (!record.email) return;
    if (record.subscribed !== undefined) record.subscribed = !/^(no|false|0|baja)$/i.test(record.subscribed || "");
    rows.push(record);
  });
  return rows;
};

module.exports = { buildClientsWorkbook, parseClientsWorkbook };
