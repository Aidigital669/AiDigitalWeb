import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function getFilePath(key) {
  const fileMap = {
    onboarding: "onboardingData.json",
    applications: "applicationsData.json",
    reminders: "remindersData.json",
    promos: "promosData.json",
    visitors: "visitorsData.json",
  };
  const fileName = fileMap[key] || `${key}.json`;
  return path.join(DATA_DIR, fileName);
}

export function readFallback(key, defaultValue = []) {
  try {
    const filePath = getFilePath(key);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Fallback] Error reading fallback data for '${key}':`, err.message);
    return defaultValue;
  }
}

export function writeFallback(key, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = getFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`[Fallback] Error writing fallback data for '${key}':`, err.message);
    return false;
  }
}

export function upsertFallback(key, item, idKey = "id") {
  try {
    const list = readFallback(key, []);
    const idx = list.findIndex((x) => String(x[idKey]) === String(item[idKey]));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.unshift(item);
    }
    writeFallback(key, list);
    return list;
  } catch (err) {
    console.error(`[Fallback] Error upserting into '${key}':`, err.message);
    return [];
  }
}

export function deleteFallback(key, id, idKey = "id") {
  try {
    const list = readFallback(key, []);
    const filtered = list.filter((x) => String(x[idKey]) !== String(id));
    writeFallback(key, filtered);
    return filtered;
  } catch (err) {
    console.error(`[Fallback] Error deleting from '${key}':`, err.message);
    return [];
  }
}
