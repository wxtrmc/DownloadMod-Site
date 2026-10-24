# Example Mod Website

The official download page for **Example**, a Fabric mod that downloads what you want from Modrinth.

Live at **[wxtrmc.net](https://wxtrmc.net)**

## Features

- Download page for Minecraft **1.21 - 1.21.11**
- Version picker: clicking **Download** opens a window to choose your Minecraft version
- Live download counter that updates for everyone instantly, no page refresh needed
- Versions without a file are shown as unavailable automatically
- Simple dark gray design, no database and no build step

## Links

- Discord: https://discord.gg/X6xZvRRQ9s
- GitHub: https://github.com/wxtrmc/DownloadMod

## Tech Stack

- Node.js
- Express
- Server-Sent Events (SSE) for the live counter
- Plain HTML, CSS and JavaScript on the front end

## Project Structure

```
.
├── mod/             # the mod .jar files
├── public/
│   ├── index.html   # the page
│   ├── icon.png     # logo
│   └── favicon.png
├── config.json      # site text, versions and links
├── count.json       # download counter (created automatically)
├── server.js
└── package.json
```

## Setup

Requires [Node.js](https://nodejs.org) 16 or newer.

```bash
npm install
npm start
```

Then open http://localhost:3000

To use another port:

```bash
PORT=8080 npm start
```

## Adding Mod Files

Put the mod `.jar` files inside the `mod` folder. Write the supported Minecraft version (or range) after `mc` in the file name:

```
example-1.0.0+mc1.21-1.21.1.jar
example-1.0.0+mc1.21.2-1.21.4.jar
example-1.0.0+mc1.21.5.jar
example-1.0.0+mc1.21.6-1.21.8.jar
example-1.0.0+mc1.21.9-1.21.11.jar
```

A range like `mc1.21.2-1.21.4` covers every version between them (1.21.2, 1.21.3 and 1.21.4).

## Configuration

Everything shown on the page comes from `config.json`:

| Field | Description |
| --- | --- |
| `siteName` | Name shown in the header and footer |
| `modName` | Mod name shown on the page |
| `description` | Short description under the name |
| `version` | Mod version |
| `loader` | Mod loader (for example Fabric) |
| `side` | Client or Server |
| `versions` | Minecraft versions shown in the version picker |
| `features` | Features list |
| `requirements` | Requirements list |
| `discord` | Discord link in the top left corner |
| `github` | GitHub link in the top left corner |

Changes to `config.json` appear on the next page load, no restart needed.

## API

| Route | Description |
| --- | --- |
| `GET /api/info` | Page info, download count and which versions are available |
| `GET /download?v=1.21.4` | Downloads the file for that version and adds 1 to the counter |
| `GET /events` | Live counter stream (SSE) |

## Deploying Behind nginx

If the site runs behind nginx, turn off buffering for the live counter route, otherwise the counter updates late:

```nginx
location /events {
    proxy_pass http://127.0.0.1:3000;
    proxy_buffering off;
}
```

## AI Disclosure

This website was built with some help from AI tools. The project idea, design decisions, content and testing are by the repository owner.

## License

This project is licensed under the [MIT License](LICENSE).

You can use it, copy it, modify it, publish it and do whatever you want with it. The only condition is to keep the copyright notice and the license text in copies of the code. The code is provided "as is", and the owner is not responsible or liable for anything that happens from using it.
