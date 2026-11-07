# Dependency compatibility

Checked on 2026-11-07 against the npm registry and the official migration guides.

## TypeScript 7

TypeScript is upgraded from 5.9.3 to 7.0.2. WXT 0.21.5 accepts TypeScript `>=5.4` and this project uses the `tsc` CLI, which TypeScript 7 still provides.

[TypeScript 7's migration notes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) describe removed compiler options, new defaults for `types` and side-effect imports, and the removal of the stable compiler API. The [TypeScript 6 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) cover the preceding changes.

WXT's generated config already uses `module: Preserve`, `moduleResolution: Bundler`, and strict checking. Its declaration files explicitly reference the WXT and Vite types. Typechecking passes without config overrides or source changes. Vite compiles the extension code separately.

## Upgrades that require upstream support

The current dependency ranges come from the installed packages and their published npm metadata. There are no overrides in this project.

- Babel 8: `wxt@0.21.5` uses `magicast@0.5.5`, which requires `@babel/parser` and `@babel/types` at `^7.29.7`. The [Babel 8 guide](https://babeljs.io/docs/v8-migration) documents ESM-only packaging and newer Node requirements. The [Babel API migration guide](https://babeljs.io/docs/v8-migration-api/) also changes AST shapes, including dynamic imports and bigint literals. Updating WXT or Magicast to a release that supports Babel 8 is the supported upgrade path.
- Undici 8: `web-ext@10.8.0` uses `addons-linter@10.14.0`, which pins `cheerio@1.2.0`. Cheerio requires Undici `^7.19.0`. The [Undici 8 migration guide](https://undici.nodejs.org/best-practices/migrating-from-v7-to-v8) changes dispatcher callbacks and enables HTTP/2 by default. A compatible Cheerio and addons-linter release must reach web-ext before this project can upgrade within the declared ranges.
- Rolldown 1.3 is a minor release. Vite 8.3.6 requires `~1.2.16`, which excludes 1.3.0. A Vite release that expands that range provides the upgrade path. The [Vite 8 migration guide](https://vite.dev/guide/migration) covers its switch to Rolldown and Oxc.
- Multiple `ansi-regex` and `confbox` versions satisfy different parent ranges. `strip-ansi@6` requires `ansi-regex@5`, while `strip-ansi@7` requires version 6. `c12@3` requires `confbox@0.2`, `pkg-types@1` requires 0.1, and `pkg-types@2` requires 0.3. Each copy remains within its parent's supported range.

## Verification scope

The [WXT upgrade guide](https://wxt.dev/guide/resources/upgrading) calls for regenerating types and checking development and production builds after migrations. The project provides these commands:

```sh
bun install --frozen-lockfile
bun run compile
bun run build
bun run build:firefox
bun run zip
bun run zip:firefox
```

Builds and package checks do not establish that the overlay still matches Google's live Calendar DOM. That requires loading the extension in a browser, checking the overlay after navigation and scrolling, and exercising the popup toggle and opacity control.

Local checks passed with Bun 1.4.2 and Node 26.13.0: frozen installation, typechecking, Chrome MV3 and Firefox MV2 production builds and ZIP packaging, packaged asset checks, and Chrome development-server startup. Firefox lint reports no errors. Its remaining warnings concern the existing missing add-on ID and data-collection declaration, which need attention before Firefox publication.
