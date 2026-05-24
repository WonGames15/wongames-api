import slugify from "slugify";

import {
  categoryService,
  developerService,
  platformService,
  publisherService,
} from "../constants/services";
import { Exception } from "../utils";

export async function getByName(name, entityService) {
  try {
    const item = await strapi.service(entityService).find({
      filters:
        entityService === developerService
          ? {
              $or: [
                { name },
                {
                  slug: slugify(name, {
                    strict: true,
                    lower: true,
                  }),
                },
              ],
            }
          : { name },
    });

    return item.results.length > 0 ? item.results[0] : null;
  } catch (error) {
    console.error("getByName:", Exception(error));
  }
}

export async function create(name, entityService) {
  try {
    let item = await getByName(name, entityService);

    if (!item) {
      item = await strapi.service(entityService).create({
        data: {
          name,
          slug: slugify(name, {
            strict: true,
            lower: true,
          }),
          publishedAt: new Date(),
        },
      });
    }

    return item;
  } catch (error) {
    console.error("create:", Exception(error));
  }
}

export async function createManyToManyData(products, isProd = false) {
  const developersSet = new Set();
  const publishersSet = new Set();
  const categoriesSet = new Set();
  const platformsSet = new Set();

  products.forEach((product) => {
    product.categories?.forEach((name) => categoriesSet.add(name));

    product.operatingSystems?.forEach((name) => platformsSet.add(name));

    product.developers?.forEach((name) => developersSet.add(name));

    product.publishers?.forEach((name) => publishersSet.add(name));
  });

  const createCall = (set, entityName) =>
    Array.from(set).map((name) => create(name, entityName));

  if (isProd) {
    await Promise.all(createCall(categoriesSet, categoryService));
    await Promise.all(createCall(platformsSet, platformService));
    await Promise.all(createCall(developersSet, developerService));
    await Promise.all(createCall(publishersSet, publisherService));
  } else {
    await Promise.all([
      ...createCall(categoriesSet, categoryService),
      ...createCall(platformsSet, platformService),
      ...createCall(developersSet, developerService),
      ...createCall(publishersSet, publisherService),
    ]);
  }
}
