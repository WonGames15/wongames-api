import axios from "axios";
import { JSDOM } from "jsdom";
import { Exception, mapRating } from "../utils";

export async function getGameInfo(slug) {
  try {
    const gogSlug = slug.replaceAll("-", "_").toLowerCase();

    const response = await axios.get(`https://www.gog.com/game/${gogSlug}`);

    const dom = new JSDOM(response.data);

    const raw_description = dom.window.document.querySelector(".description");

    const ratingElement = dom.window.document.querySelector(
      ".age-restrictions__icon use",
    );

    const rawRating = ratingElement
      ? ratingElement
          .getAttribute("xlink:href")
          ?.replace(/_/g, "")
          .replace("#", "")
      : "";

    if (process.env.SEED === "true") {
      console.log(
        "***************************************************************************************************************************************************",
      );
      console.log("slug:", slug);

      console.log("=== HEADERS ===");
      console.log(response.headers);

      console.log("=== STATUS ===");
      console.log(response.status);

      console.log("=== REQUEST HEADERS ===");
      console.log(response.request?.headers);

      console.log("=== RESPONSE DATA ===");
      console.log(response.data.slice(0, 2000));

      console.log(
        "LANG:",
        response.data.includes("pt-BR"),
        response.data.includes("en-US"),
      );
      console.log("BR:", response.data.includes("#BR_18"));
      console.log("ESRB:", response.data.includes("#esrb"));

      console.log(
        "ratingElement All",
        console.log({
          outerHTML: ratingElement?.outerHTML,
          innerHTML: ratingElement?.innerHTML,
          textContent: ratingElement?.textContent,
          attributes: ratingElement?.getAttributeNames()?.map((attr) => ({
            name: attr,
            value: ratingElement.getAttribute(attr),
          })),
          href: ratingElement?.getAttribute("href"),
          xlinkHref: ratingElement?.getAttribute("xlink:href"),
          nodeName: ratingElement?.nodeName,
          tagName: ratingElement?.tagName,
          className: ratingElement?.className,
        }),
      );
      console.log("rawRating:", rawRating);
      console.log("mappedRating:", mapRating(rawRating));
      console.log(
        "***************************************************************************************************************************************************",
      );
    }

    return {
      rating: mapRating(rawRating),
      description: raw_description?.innerHTML || "",
      short_description: raw_description?.textContent?.slice(0, 160) || "",
    };
  } catch (error) {
    console.error("getGameInfo:", Exception(error));
    return {};
  }
}
