import axios from "axios";
import fs from "fs";
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
      const { data } = await axios.get(image, {
        responseType: "arraybuffer",
      });

      buffer = Buffer.from(data, "base64");
    } else {
      /*
       * LOCAL IMAGE
       */
      const imagePath = path.resolve(image);

      buffer = fs.readFileSync(imagePath);
    }

    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("refId", refId);
    formData.append("ref", ref);
    formData.append("field", field);

    formData.append("files", buffer, {
      filename,
    });

    const response = await axios.post(
      "http://localhost:1337/api/upload",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data[0];
  } catch (error) {
    console.error("setImage:", Exception(error));
  }
}
