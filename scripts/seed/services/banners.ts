import { bannerService } from "../constants/services";
import { setImage } from "./upload";

export async function createBanners(banners) {
  for (const banner of banners) {
    const filename = banner.image.split("/").pop();

    const bannerExisting = await strapi.service(bannerService).find({
      filters: {
        title: banner.title,
        image: {
          name: filename,
        },
      },
      populate: ["image"],
    });

    const existingBanner = bannerExisting.results?.[0];

    const data = {
      title: banner.title,
      subtitle: banner.subtitle,
      button: banner.button
        ? {
            label: banner.button.label,
            link: banner.button.link,
          }
        : null,
      ribbon: banner.ribbon
        ? {
            text: banner.ribbon.text,
            color: banner.ribbon.color,
            size: banner.ribbon.size,
          }
        : null,
      publishedAt: new Date(),
    };

    if (existingBanner) {
      console.log("EDITANDO BANNER...");

      const updatedBanner = await strapi
        .service(bannerService)
        .update(existingBanner.documentId, {
          data,
        });

      await setImage({
        image: banner.image,
        ref: bannerService,
        refId: updatedBanner.id,
        filename,
        field: "image",
      });

      console.log("updatedBanner", updatedBanner);
    } else {
      console.log("CRIANDO BANNER...");

      const createdBanner = await strapi.service(bannerService).create({
        data,
      });

      await setImage({
        image: banner.image,
        ref: bannerService,
        refId: createdBanner.id,
        filename,
        field: "image",
      });

      console.log("createdBanner", createdBanner);
    }
  }
}
