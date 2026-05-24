import { getGameInfo } from "./gog";
import { setImage } from "./upload";
import { getByName } from "./entities";
import {
  categoryService,
  developerService,
  gameService,
  platformService,
  publisherService,
} from "../constants/services";

export async function createGames(products) {
  await Promise.all(
    products.map(async (product) => {
      const existing = await getByName(product.title, gameService);

      if (existing) return;

      console.log("CRIANDO GAME... =>", product.title);

      const game = await strapi.service(gameService).create({
        data: {
          name: product.title,
          slug: product.slug,
          price: product.price || 0,
          release_date: new Date(product.releaseDate),

          categories: await Promise.all(
            product.categories.map((name) => getByName(name, categoryService)),
          ),
          platforms: await Promise.all(
            product.operatingSystems.map((name) =>
              getByName(name, platformService),
            ),
          ),
          developers: await Promise.all(
            product.developers.map((name) => getByName(name, developerService)),
          ),
          publisher: await Promise.all(
            product.publishers.map((name) => getByName(name, publisherService)),
          ),

          ...(await getGameInfo(product.slug)),
          publishedAt: new Date(),
        },
      });

      if (product.coverHorizontal) {
        await setImage({
          image: product.coverHorizontal,
          ref: gameService,
          refId: game.id,
          filename: `${game.slug}.jpg`,
        });
      }

      if (product.screenshots?.length) {
        for (const url of product.screenshots.slice(0, 5)) {
          setImage({
            image: url.replace(
              "{formatter}",
              "product_card_v2_mobile_slider_639",
            ),
            ref: gameService,
            refId: game.id,
            filename: `${game.slug}.jpg`,
            field: "gallery",
          });
        }
      }
    }),
  );
}
