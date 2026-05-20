import { recommendedService, gameService } from "../constants/services";
import { setImage } from "./upload";

export async function createRecommended() {
  console.log("CRIANDO SINGLE_TYPE RECOMMENDED...");

  const existingRecommended = await strapi.service(recommendedService).find();
  console.log("EXIST_RECOMMENDED", existingRecommended);

  const games = await strapi.service(gameService).find({
    sort: "price:desc",
    pagination: {
      limit: 8,
    },
  });

  const data = {
    section: {
      title: "Recommended Games",
      games: games.results,
      highlight: {
        title: "Cyberpunk 2077",
        subtitle: "Night City awaits you",
        background: null,
        floatImage: null,
        buttonLabel: "Buy now",
        buttonLink: "/games/cyberpunk-2077",
        alignment: "right" as const,
      },
    },
  };

  let recommended;

  if (existingRecommended?.documentId) {
    recommended = await strapi.documents(recommendedService).update({
      documentId: existingRecommended.documentId,
      data,
      populate: {
        section: {
          populate: {
            highlight: true,
          },
        },
      },
    });
  } else {
    recommended = await strapi.documents(recommendedService).create({
      data,
      populate: {
        section: {
          populate: {
            highlight: true,
          },
        },
      },
    });
  }

  let uploadedBackground;
  let uploadedFloatImage;

  if (!recommended.section.highlight?.background) {
    uploadedBackground = await setImage({
      image: "./scripts/seed/assets/recommended_background.jpg",
      refId: recommended.id,
      ref: recommendedService,
      filename: "recommended_background.jpg",
      field: "tmp",
    });
  }

  if (!recommended.section.highlight?.floatImage) {
    uploadedFloatImage = await setImage({
      image: "./scripts/seed/assets/recommended_floatImage.jpg",
      refId: recommended.id,
      ref: recommendedService,
      filename: "recommended_floatImage.jpg",
      field: "tmp",
    });
  }

  recommended = await strapi.documents(recommendedService).update({
    documentId: recommended.documentId,
    data: {
      section: {
        ...recommended.section,
        highlight: {
          ...recommended.section.highlight,
          ...(uploadedBackground ? { background: uploadedBackground.id } : {}),
          ...(uploadedFloatImage ? { floatImage: uploadedFloatImage.id } : {}),
        },
      },
    },
  });

  return recommended;
}
