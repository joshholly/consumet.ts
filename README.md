<p align="center"><img src="https://consumet.org/images/consumetlogo.png" width="175"/></p>

<h1 align="center"> consumet.ts with WHVX Megacloud API Support</h1>

consumet.ts is a Node library which provides high-level APIs to get information about several entertainment mediums like books, movies, comics, anime, manga, etc.

This particular fork gets FlixHQ links from the WHVX megacloud API. You must have a WHVX megacloud API token to use the API. 

To use the WHVX Megacloud API, in the script you're using this package in, set the MEGACLOUD_TOKEN environment variable with your WHVX Megacloud API token.

To get a WHVX Megacloud API token, email dev@whvx.net or contact .trainreq on Discord. 

<p align="center">
  <a href="https://www.npmjs.com/package/@consumet/extensions">
    <img src="https://img.shields.io/npm/v/@consumet/extensions" alt="npm (scoped)">
  </a>
  <a href="https://github.com/consumet/consumet.ts/actions/workflows/npm-publish.yml">
    <img src="https://github.com/consumet/consumet.ts/actions/workflows/npm-publish.yml/badge.svg" alt="npm (scoped)">
  </a>
    <a href="https://discord.gg/t9utDXUb">
      <img src="https://img.shields.io/discord/987492554486452315?color=7289da&label=discord&logo=discord&logoColor=7289da" alt="VidBinge Discord to get WHVX Megacloud API Token">
    </a>
      <a href="https://github.com/consumet/consumet.ts/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/@consumet/extensions" alt="GitHub">
  </a>
</p>

<h2> Table of Contents </h2>

- [Quick Start](#quick-start)
  - [Installation](#installation)
  - [Usage](#usage)
- [Documentation](#documentation)
- [Ecosystem](#ecosystem)
- [Provider Request](#provider-request)
- [Contributing](#contributing)
- [Support](#support)
- [Contributors ✨](#contributors-)
  - [Credits](#credits)
- [License](#license)

## Quick Start

### Installation

To use consumet.ts in your project, run:
```bash
yarn add @consumet/extensions
# or "npm i @consumet/extensions"
```

### Usage

**Example** - searching for a book using the libgen provider.
```ts
import { BOOKS } from "@consumet/extensions"

// Create a new instance of the Libgen provider
const books = new BOOKS.Libgen();
// Search for a book. In this case, "Pride and Prejudice"
const data = books.search('pride and prejudice').then(data => {
  // print results
  console.log(data)
})
```

**Example** - searching for anime using the gogoanime provider.
```ts
import { ANIME } from "@consumet/extensions"

// Create a new instance of the Gogoanime provider
const gogoanime = new ANIME.Gogoanime();
// Search for an anime. In this case, "One Piece"
const results = gogoanime.search("One Piece").then(data => {
  // print results
  console.log(data);
})
```

Do you want to know more? Head to the [`Getting Started`](https://github.com/consumet/consumet.ts/tree/master/docs/guides/getting-started.md).

## Documentation
- [`Getting Started`](./docs/guides/getting-started.md)
- [`Guides`](https://github.com/consumet/consumet.ts/tree/master/docs)
- [`Anime`](./docs/guides/anime.md)
- [`Manga`](./docs/guides/manga.md)
- [`Books`](./docs/guides/books.md)
- [`Movies`](./docs/guides/movies.md)
- [`Light Novels`](./docs/guides/light-novels.md)
- [`Comics`](./docs/guides/comics.md)
- [`Meta`](./docs/guides/meta.md)
- [`News`](./docs/guides/news.md)

## Ecosystem
- [Rest-API Reference](https://docs.consumet.org/) - public rest api documentation
- [Examples](https://github.com/consumet/consumet.ts/tree/master/examples) - examples of using consumet.ts.
- [Provider Status](https://github.com/consumet/providers-status/blob/main/README.md) - A list of providers and their status.
- [Changelog](https://github.com/consumet/consumet.ts/blob/master/CHANGELOG.md) - See the latest changes.
- [Discord Server](https://discord.gg/qTPfvMxzNH) - Join our discord server and chat with the maintainers.

## Provider Request
Make a new [issue](https://github.com/consumet/consumet.ts/issues/new?assignees=&labels=provider+request&template=provider-request.yml) with the name of the provider on the title, as well as a link to the provider in the body paragraph.

## Contributing
Check out [contributing guide](https://github.com/consumet/consumet.ts/blob/master/CONTRIBUTING.md) to get an overview of consumet.ts development.

## Support
You can contact the maintainers of consumet.ts via [email](mailto:consumet.org@gmail.com), or [join the discord server](https://discord.gg/qTPfvMxzNH) (Recommended).

<a href="https://discord.gg/qTPfvMxzNH">
   <img src="https://discordapp.com/api/guilds/987492554486452315/widget.png?style=banner2">
</a>

## Contributors ✨
Thanks to the following people for keeping this project alive and thriving.

[![](https://contrib.rocks/image?repo=consumet/consumet.ts)](https://github.com/consumet/consumet.ts/graphs/contributors)

### Credits
- [Anify API](https://github.com/Eltik/Anify) - Used as a caching layer for the meta/anilist provider to speed up responses. 

## License
Licensed under [MIT](./LICENSE).
