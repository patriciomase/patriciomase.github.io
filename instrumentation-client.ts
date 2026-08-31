import { initBotId } from "botid/client/core";

/** Contact form on "/" posts here via the submitContact Server Action. */
initBotId({
  protect: [{ path: "/", method: "POST" }],
});
