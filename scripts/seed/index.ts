import axios from "axios";
import { banners, games } from "./data";
import { createGames } from "./services/games";
import { createBanners } from "./services/banners";
import { createManyToManyData } from "./services/entities";
import { bannerService } from "./constants/services";
import { createHome } from "./services/home";
import { createRecommended } from "./services/recommended";
import { createUsers } from "./services/users";
import { setPermissions } from "./services/permissions";

export async function seed(strapiInstance) {
  global.strapi = strapiInstance;

  console.log("🌱 Starting seed...");

  try {
    createUsers();
    await setPermissions();

    const countGames = await strapi.db.query("api::game.game").count();
    console.log("countGames =>>", countGames);

    if (countGames === 0) {
      await createManyToManyData(games);

      const strapiUrl = process.env.STRAPI_URL ?? "http://localhost:1337";
      const { data: uploads } = await axios.get(
        `${strapiUrl}/api/upload/files`,
      );
      const hasUploads = uploads?.length > 0;

      // Se já houver uploads anteriores, cria todos os jogos de uma vez.
      // Caso contrário, cria o primeiro para gerar o upload inicial
      // e depois cria o restante.
      if (hasUploads) {
        await createGames(games);
      } else {
        await createGames([games[0]]);
        await createGames(games.slice(1));
      }

      await Promise.all([createHome(), createRecommended()]);
    }

    const countBanners = await strapi.db.query(bannerService).count();
    console.log("countBanners =>>", countBanners);

    if (countBanners > 0) await createBanners(banners);

    console.log("✅ Seed finished");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}
