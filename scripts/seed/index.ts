import axios from "axios";
import { banners, games } from "./data";
import { createGames } from "./services/games";
import { createBanners } from "./services/banners";
import { createManyToManyData } from "./services/entities";
import { bannerService } from "./constants/services";
import { createHome } from "./services/home";
import { createRecommended } from "./services/recommended";
import { createUsers } from "./services/users";
// import { setPermissions } from "./services/permissions";

export async function seed(strapiInstance, isProd = false) {
  global.strapi = strapiInstance;

  console.log("🌱 Starting seed...");
  console.log("IsProd =>", isProd);

  try {
    createUsers();
    // Permissões e configs ja sendo adicionadas pelo plugin: 'strapi-plugin-config-sync'
    // await setPermissions();

    const countBanners = await strapi.db.query(bannerService).count();
    console.log("countBanners =>>", countBanners);

    if (countBanners === 0) await createBanners(banners);

    const countGames = await strapi.db.query("api::game.game").count();
    console.log("countGames =>>", countGames);

    if (countGames === 0) {
      await createManyToManyData(games, isProd);

      const uploads = await strapi.db.query("plugin::upload.file").findMany({});

      const hasUploads = uploads?.length > 0;

      // Se já houver uploads anteriores, cria todos os jogos de uma vez.
      // Caso contrário, cria o primeiro para gerar o upload inicial
      // e depois cria o restante.
      if (hasUploads) {
        await createGames(games, isProd);
      } else {
        await createGames([games[0]], isProd);
        await createGames(games.slice(1), isProd);
      }

      if (isProd) {
        await createHome();
        await createRecommended();
      } else {
        await Promise.all([createHome(), createRecommended()]);
      }
    }

    console.log("✅ Seed finished");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}
