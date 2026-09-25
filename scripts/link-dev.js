import os from "os";
import { join, resolve } from "path";
import symlinkDir from "symlink-dir";

const foundryModules =
    process.env.FOUNDRY_MODULES_PATH ||
    (process.platform === "win32"
        ? join(
              os.homedir(),
              "AppData",
              "Local",
              "FoundryVTT",
              "Data",
              "modules"
          )
        : join(
              os.homedir(),
              ".local",
              "share",
              "FoundryVTT",
              "Data",
              "modules"
          ));

const moduleName = "token-walk-animation";
const modulePath = join(foundryModules, moduleName);

async function main() {
    console.log(`Linking dev → ${modulePath}`);
    await symlinkDir(resolve("dev"), modulePath);
    await symlinkDir(resolve("docs"), join("dev", "docs"));
    await symlinkDir(resolve("assets"), join("dev", "assets"));
    await symlinkDir(resolve("templates"), join("dev", "templates"));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
