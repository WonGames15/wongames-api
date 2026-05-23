import { homeService, gameService } from "../constants/services";
import { setImage } from "./upload";

const populate = {
  popularGames: {
    populate: {
      highlight: true,
      games: true,
    },
  },

  upcomingGames: {
    populate: {
      highlight: true,
    },
  },

  freeGames: {
    populate: {
      highlight: true,
    },
  },
};

async function uploadHighlightImages({
  home,
  section,
  background,
  floatImage,
}) {
  const highlight = home[section]?.highlight;

  let uploadedBackground;
  let uploadedFloatImage;

  if (!highlight?.background) {
    uploadedBackground = await setImage({
      image: background,
      refId: home.id,
      ref: homeService,
      filename: background.split("/").pop(),
      field: "tmp",
    });
  }

  if (!highlight?.floatImage) {
    uploadedFloatImage = await setImage({
      image: floatImage,
      refId: home.id,
      ref: homeService,
      filename: floatImage.split("/").pop(),
      field: "tmp",
    });
  }

  return {
    ...(uploadedBackground ? { background: uploadedBackground.id } : {}),

    ...(uploadedFloatImage ? { floatImage: uploadedFloatImage.id } : {}),
  };
}

export async function createHome() {
  console.log("CRIANDO SINGLE_TYPE HOME...");

  const existingHome = await strapi.service(homeService).find();
  console.log("EXISTING_HOME", existingHome);

  const popularGames = await strapi.service(gameService).find({
    sort: "price:desc",
    pagination: {
      limit: 8,
    },
  });

  const data = {
    newGames: {
      title: "New Games",
    },

    popularGames: {
      title: "Most Popular Games",
      games: popularGames.results,

      highlight: {
        title: "Read Dead está de de volta!",
        subtitle: "Venha conhecer as novas aventuras de John Marston",
        background: null,
        floatImage: null,
        buttonLabel: "Buy now",
        buttonLink: "/games",
        alignment: "right" as const,
      },
    },

    upcomingGames: {
      title: "Upcoming Games",

      highlight: {
        title: "Borderlands 3!",
        subtitle: "Borderlands está de volta com muitas novidades.",
        background: null,
        floatImage: null,
        buttonLabel: "Pre-order now",
        buttonLink: "/games",
        alignment: "left" as const,
      },
    },

    freeGames: {
      title: "Free Games",

      highlight: {
        title: "Já conhece o clássico CS:GO?",
        subtitle: "Jogue um dos maiores clássicos do FPS",
        background: null,
        floatImage: null,
        buttonLabel: "Play now",
        buttonLink: "/games",
        alignment: "right" as const,
      },
    },

    publishedAt: new Date(),
  };

  let home;

  if (existingHome?.documentId) {
    home = await strapi.documents(homeService).update({
      documentId: existingHome.documentId,
      data,
      status: "published",
      populate,
    });
  } else {
    home = await strapi.documents(homeService).create({
      data,
      status: "published",
      populate,
    });
  }

  const [popularGamesMedia, upcomingGamesMedia, freeGamesMedia] =
    await Promise.all([
      uploadHighlightImages({
        home,
        section: "popularGames",
        background: "./scripts/seed/assets/red_dead_backhround.jpg",
        floatImage: "./scripts/seed/assets/red_dead_floatImage.jpg",
      }),

      uploadHighlightImages({
        home,
        section: "upcomingGames",
        background: "./scripts/seed/assets/borderlands_background.jpg",
        floatImage: "./scripts/seed/assets/borderlands_floatImage.jpg",
      }),

      uploadHighlightImages({
        home,
        section: "freeGames",
        background: "./scripts/seed/assets/cs_background.jpg",
        floatImage: "./scripts/seed/assets/cs_floatImage.jpg",
      }),
    ]);

  home = await strapi.documents(homeService).update({
    documentId: home.documentId,

    data: {
      popularGames: {
        title: home.popularGames.title,
        games: home.popularGames.games,

        highlight: {
          title: home.popularGames.highlight.title,
          subtitle: home.popularGames.highlight.subtitle,
          buttonLabel: home.popularGames.highlight.buttonLabel,
          buttonLink: home.popularGames.highlight.buttonLink,
          alignment: home.popularGames.highlight.alignment,

          background:
            popularGamesMedia.background ||
            home.upcomingGames.highlight.background?.id,

          floatImage:
            popularGamesMedia.floatImage ||
            home.upcomingGames.highlight.floatImage?.id,
        },
      },

      upcomingGames: {
        title: home.upcomingGames.title,

        highlight: {
          title: home.upcomingGames.highlight.title,
          subtitle: home.upcomingGames.highlight.subtitle,
          buttonLabel: home.upcomingGames.highlight.buttonLabel,
          buttonLink: home.upcomingGames.highlight.buttonLink,
          alignment: home.upcomingGames.highlight.alignment,

          background:
            upcomingGamesMedia.background ||
            home.upcomingGames.highlight.background?.id,

          floatImage:
            upcomingGamesMedia.floatImage ||
            home.upcomingGames.highlight.floatImage?.id,
        },
      },

      freeGames: {
        title: home.freeGames.title,

        highlight: {
          title: home.freeGames.highlight.title,
          subtitle: home.freeGames.highlight.subtitle,
          buttonLabel: home.freeGames.highlight.buttonLabel,
          buttonLink: home.freeGames.highlight.buttonLink,
          alignment: home.freeGames.highlight.alignment,

          background:
            freeGamesMedia.background ||
            home.upcomingGames.highlight.background?.id,

          floatImage:
            freeGamesMedia.floatImage ||
            home.upcomingGames.highlight.floatImage?.id,
        },
      },
    },

    status: "published",
  });

  return home;
}
