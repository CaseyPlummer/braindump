import { join } from "node:path";
import { isMainModule } from "@angular/ssr/node";
import { startHostServer } from "../../shell/host-server";

export const reqHandler = startHostServer({
  hostName: "host",
  browserDistFolder: join(import.meta.dirname, "../browser"),
  defaultPort: 8140,
  listen: isMainModule(import.meta.url),
});
