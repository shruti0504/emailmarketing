import csv from "csv-parser";
import { Readable } from "stream";
import { ContactService } from "./contact.service.js";
import { TagService } from "./tag.service.js";


const contactService = new ContactService();
const tagService = new TagService();

export class CsvService {

    async importContacts(
        fileBuffer: Buffer,
        workspaceId: string
    ) {

        const rows: any[] = [];

        await new Promise((resolve, reject) => {

            Readable
                .from(fileBuffer)
                .pipe(csv())
                .on("data", (row) => {
                    rows.push(row);
                })
                .on("end", resolve)
                .on("error", reject);

        });


        let added = 0;
        let duplicates = 0;
        let failed = 0;


        for (const row of rows) {

            try {
                const {
                    name,
                    email,
                    phone,
                    city,
                    tags,
                    ...customFields
                } = row;

               const contact =
await contactService.createContact(
  workspaceId,
  {
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
     tags: row.tags
      ? row.tags.split(",")
      : [],
    customFields: {},
  }
);
if (row.tags) {

  const tags =
    row.tags.split(",");

  await tagService.assignTags(
    workspaceId,
    contact.id,
    tags
  );
}

                added++;

            } catch (error: any) {

                if (error.statusCode === 409) {
                    duplicates++;
                }
                else {
                    failed++;
                }

            }

        }


        return {
            total: rows.length,
            added,
            duplicates,
            failed
        };

    }

}