import axios from "axios";
import { JSDOM } from "jsdom";
import { Exception, mapRating } from "../utils";

export async function getGameInfo(slug) {
  try {
    const gogSlug = slug.replaceAll("-", "_").toLowerCase();

    const { data } = await axios.get(`https://www.gog.com/game/${gogSlug}`);
    const dom = new JSDOM(data);

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
      console.log("ratingElement:", ratingElement);
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
