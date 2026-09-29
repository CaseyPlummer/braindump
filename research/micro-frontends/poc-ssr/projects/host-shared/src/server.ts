import { join } from "node:path";
import { isMainModule } from "@angular/ssr/node";
import { startHostServer } from "../../shell/host-server";

export const reqHandler = startHostServer({
  hostName: "host-shared",
  browserDistFolder: join(import.meta.dirname, "../browser"),
  defaultPort: 8141,
  listen: isMainModule(import.meta.url),
});
