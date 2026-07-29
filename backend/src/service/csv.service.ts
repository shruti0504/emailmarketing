import csv from "csv-parser";
import { Readable } from "stream";
import { ContactRepository } from "../repositories/contact.repository.js";
import { TagService } from "./tag.service.js";
import { AppError } from "../utils/AppError.js";

const contactRepository = new ContactRepository();
const tagService = new TagService();

export class CsvService {
  async importContacts(fileBuffer: Buffer, workspaceId: string) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new AppError("Uploaded CSV file is empty", 400);
    }

    const rawRows: Record<string, string>[] = [];

    await new Promise((resolve, reject) => {
      Readable.from(fileBuffer)
        .pipe(
          csv({
            mapHeaders: ({ header }) =>
              header
                .replace(/^\uFEFF/, "") // Strip BOM
                .trim()
                .toLowerCase(),
          })
        )
        .on("data", (row) => {
          rawRows.push(row);
        })
        .on("end", resolve)
        .on("error", (err) => {
          reject(new AppError(`Failed to parse CSV file: ${err.message}`, 400));
        });
    });

    if (rawRows.length === 0) {
      throw new AppError("No data rows found in CSV file", 400);
    }

    let added = 0;
    let duplicates = 0;
    let failed = 0;
    const failedRows: { rowNumber: number; reason: string }[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNumber = index + 2; // Header is line 1

      try {
        const rawName = (row.name || row["full name"] || row.fullname || "").trim();
        const rawEmail = (row.email || row["email address"] || "").trim().toLowerCase();
        const rawPhone = (row.phone || row["phone number"] || row.mobile || "").trim();
        const rawCity = (row.city || row.location || "").trim();
        const rawTags = row.tags || row.tag || "";

        const email = rawEmail || undefined;
        const phone = rawPhone || undefined;
        const city = rawCity || undefined;

        let name = rawName;
        if (!name && email) {
          name = email.split("@")[0];
        }

        if (!name) {
          failed++;
          failedRows.push({
            rowNumber,
            reason: "Missing contact name and email",
          });
          continue;
        }

        // Email regex check if email is provided
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            failed++;
            failedRows.push({
              rowNumber,
              reason: `Invalid email format: "${email}"`,
            });
            continue;
          }
        }

        // Check for duplicate in DB
        const existing = await contactRepository.findDuplicate(
          workspaceId,
          email,
          phone
        );

        if (existing) {
          duplicates++;
          continue;
        }

        // Extract custom fields (any unrecognized header)
        const knownKeys = [
          "name",
          "full name",
          "fullname",
          "email",
          "email address",
          "phone",
          "phone number",
          "mobile",
          "city",
          "location",
          "tags",
          "tag",
          "company",
          "designation",
          "title",
        ];

        const customFields: Record<string, string> = {};
        Object.keys(row).forEach((key) => {
          if (!knownKeys.includes(key) && row[key]) {
            customFields[key] = row[key].trim();
          }
        });

        // Parse tags
        const tags = typeof rawTags === "string"
          ? rawTags
              .split(/[,;]+/)
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        // Create contact
        const contact = await contactRepository.create(workspaceId, {
          name,
          email,
          phone,
          city,
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        });

        if (tags.length > 0 && contact) {
          await tagService.assignTags(workspaceId, contact.id, tags);
        }

        added++;
      }catch (err: any) {
  console.error("Row:", rowNumber);
  console.error("Data:", row);
  console.error(err);

  failed++;
  failedRows.push({
    rowNumber,
    reason: err?.message || "Unknown error",
  });
}
    }
console.log(rawRows);
    const skipped = duplicates + failed;

    return {
        test: "HELLO_FROM_NEW_BUILD",
      total: rawRows.length,
      imported: added,
      added,
      skipped,
      duplicates,
      failed,
      failedRows,
    };
    
  }
}