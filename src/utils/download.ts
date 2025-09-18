import path from "path";
import fs from "fs-extra";
import { Page, Download } from "@playwright/test";

const DOWNLOADS_DIR = path.resolve(process.cwd(), "downloads");

export async function prepareDownloadsDir() {
  await fs.ensureDir(DOWNLOADS_DIR);
  await fs.emptyDir(DOWNLOADS_DIR);
}

export async function saveNextDownload(page: Page): Promise<{ filePath: string; filename: string; download: Download }> {
  // Listen for the next download event
  const downloadPromise = page.waitForEvent("download");
  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  const filePath = path.join(DOWNLOADS_DIR, filename);
  await download.saveAs(filePath);
  return { filePath, filename, download };
}
