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
      try {
        const { data } = await axios.get(image, {
          responseType: "arraybuffer",
          timeout: 10000,
        });
        buffer = Buffer.from(data, "base64");
      } catch (err) {
        console.warn(`⚠️ Skipping image (network error): ${filename}`);
        return null; // 👈 continua o seed sem imagem
      }
    } else {
      /*
       * LOCAL IMAGE
       */
      buffer = fs.readFileSync(path.resolve(image));
    }

    // Salva em arquivo temporário
    const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`);

    fs.writeFileSync(tmpPath, buffer);

    const uploadedFiles = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        data: { refId, ref, field },
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
    try {
      fs.unlinkSync(tmpPath);
    } catch (e) {
      console.error("Erro ao remover arquivo temporário");
    }

    return uploadedFiles[0];
  } catch (error) {
    console.error("setImage:", Exception(error));
  }
}
