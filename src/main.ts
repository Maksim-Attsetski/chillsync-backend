import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./modules";
import config from "./modules/config";

const PORT = process.env.PORT || 3000;

async function loadServer() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(config.corsOptions);
  app.use(cookieParser("secret_cookie"));
  app.setGlobalPrefix("/api/v1");

  await app.listen(PORT, "0.0.0.0", () => {
    console.log("start on " + PORT);
  });
}
void loadServer();
