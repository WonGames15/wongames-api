import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import { Exception } from "../utils";

export async function setImage({
  image,
  ref,
  refId,
  filename,
  field = "cover",
}) {
  try {
    let buffer;

    /*
     * URL IMAGE
     */
    if (image.startsWith("http")) {
      const { data } = await axios.get(image, { responseType: "arraybuffer" });
      buffer = Buffer.from(data, "base64");
    } else {
      /*
       * LOCAL IMAGE
       */
      const imagePath = path.resolve(image);

      buffer = fs.readFileSync(imagePath);
    }

    // Salva em arquivo temporário
    const tmpPath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tmpPath, buffer);

    console.log("tmpPath", tmpPath);

    // Usa o serviço interno do Strapi, sem passar pela API HTTP
    const uploadedFiles = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        data: {
          refId,
          ref,
          field,
        },

        files: {
          path: tmpPath,
          filepath: tmpPath,

          name: filename,
          originalFilename: filename,

          type: "image/jpeg",
          mimetype: "image/jpeg",

          size: buffer.length,
        },
      });

    // Remove o arquivo temporário
    fs.unlinkSync(tmpPath);

    return uploadedFiles[0];
  } catch (error) {
    console.error("setImage:", Exception(error));
  }
}
