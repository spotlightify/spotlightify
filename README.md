<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GLP-3.0 License][license-shield]][license-url]
[![Discord][discord-shield]][discord-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/spotlightify/spotlightify">
    <img src="media/logo.svg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Spotlightify</h3>

  <p align="center">
    The fastest way to use Spotify.
    <br />
    <br />
    <a href="https://github.com/spotlightify/spotlightify/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/spotlightify/spotlightify/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

  * [About The Project](#about-the-project)
    * [Built With](#built-with)
  * [Development](#development)
    * [Prerequisites](#prerequisites)
    * [Live development build](#live-development-build)
    * [Building](#building)
  * [Usage](#usage)
    * [List of Commands](#list-of-commands)
  * [Roadmap](#roadmap)
  * [Contributing](#contributing)
  * [Contact](#contact)
  * [Acknowledgments](#acknowledgments)
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Spotlightify is a GUI based application designed to allow users to quickly interact with Spotify playback
across Windows, Linux and macOS. Created with simplicity and efficiency in mind, Spotlightify allows users to 
seamlessly control their music experience without having to navigate through Spotify's native interface.

https://github.com/user-attachments/assets/ba116d21-bfd5-4106-9cb3-5bfff65afcfb

### Built With

* [![Wails][Wails.com]][Wails-url]
* [![Go][Go.com]][Go-url]
* [![React][React.js]][React-url]
* [![Tailwind][Tailwind.com]][Tailwind-url]
* [![Vite][Vite.com]][Vite-url]


## Development

Spotlightify is currently in development and could benefit from your help!

If you are interested in testing Spotlightify, please follow the instructions below to get started.

Development of this application is currently taking place on macOS, so Windows and Linux users may experience issues.

### Prerequisites

- Go `1.22.5` or later
- Node.js `20.11.1`
- NPM `10.24.0`
- Wails `2.0.0` or later
- Spotify Premium Account
  - Spotify API Application, instructions can be found [here](https://spotlightify.github.io/instructions)

### Live development build

To run in live development mode, run the following command in the project directory:

```shell
wails dev
```

### Building

To build a redistributable, production mode package, run the following in the project directory:

```shell
wails build
```



<!-- USAGE EXAMPLES -->
## Usage

The GUI is activated by using the shortcut `control + alt + space` for Windows and `control + option + space` for macOS.
Here is the current list of available functions:

### List of Commands

```
| Name     | Description                                        | Keyword           | Input         | Implemented? |
|----------|----------------------------------------------------|-------------------|---------------|--------------|
| Play     | Find and play a song                               | play              | song name     | ✅           |
| Queue    | Find and queues a song                             | queue             | song name     | ✅           |
| Playlist | Find and play a saved/followed playlist            | playlist          | playlist name | ✅           |
| Album    | Find and play a saved album                        | album             | album name    | ✅           |
| Artist   | Find and play songs from a saved/followed artist   | artist            | artist name   | ✅           |
| Liked    | Plays saved/liked music                            | liked             | None          | ❌           |
| Volume   | Changes music volume                               | volume            | 1 - 10        | ❌           |
| Go to    | Seeks a position in a song                         | goto              | e.g. 1:24     | ❌           |
| Resume   | Resumes music playback                             | resume            | None          | ✅           |
| Skip     | Skips the current song                             | next              | None          | ✅           |
| Previous | Plays pervious song                                | previous          | None          | ✅           |
| Pause    | Pauses music playback                              | pause             | None          | ✅           |
| Shuffle  | Toggles shuffle playback                           | shuffle           | None          | ❌           |
| Device   | Select device for music playback                   | device            | None          | ✅           |
| Repeat   | Toggles repeating modes                            | repeat            | None          | ❌           |
| Current  | Provides currently playing song info and sharing   | currently playing | None          | ✅           |
| Auth     | Authenticate with Spotify                          | Authenticate      | Credentials   | -            |
| Exit     | Exits the application                              | exit              | None          | ❌           |
```

<!-- ROADMAP -->
## Roadmap

- [ ] Complete authentication command
- [ ] Implement features to be in functional parity with legacy version
- [ ] Increase Windows Compatibility
- [ ] Increase Linux Compatibility

<!-- CONTRIBUTING -->
## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Join us on [discord](https://discord.gg/nrDke3q) to learn more about contributing to the project.

<!-- CONTACT -->
## Contact

Please report any bugs or possible feature requests in the Issues section of this GitHub repository.

Any more general discussions regarding Spotlightify can be directed to the Discussions section of this repository.

To learn more about Spotlightify, feel free to join our [discord server](https://discord.gg/nrDke3q).

## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

* [Wails React Typescript Project Base](https://github.com/hotafrika/wails-vite-react-ts-tailwind-template)



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/spotlightify/spotlightify.svg?style=for-the-badge
[contributors-url]: https://github.com/spotlightify/spotlightify/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/spotlightify/spotlightify.svg?style=for-the-badge
[forks-url]: https://github.com/spotlightify/spotlightify/network/members
[stars-shield]: https://img.shields.io/github/stars/spotlightify/spotlightify.svg?style=for-the-badge
[stars-url]: https://github.com/spotlightify/spotlightify/stargazers
[issues-shield]: https://img.shields.io/github/issues/spotlightify/spotlightify.svg?style=for-the-badge
[issues-url]: https://github.com/spotlightify/spotlightify/issues
[license-shield]: https://img.shields.io/github/license/spotlightify/spotlightify.svg?style=for-the-badge
[license-url]: https://github.com/spotlightify/spotlightify/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-%230A66C2?style=for-the-badge&logo=linkedin&logoColor=ffffff
[linkedin-url]: https://linkedin.com/in/peter-g-murphy
[discord-shield]: https://img.shields.io/badge/Discord-%235865F2?style=for-the-badge&logo=discord&logoColor=ffffff
[discord-url]: https://discord.gg/nrDke3q
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
[Go.com]: https://img.shields.io/badge/Go-Go%20Programming%20Language?style=for-the-badge&logo=Go&logoColor=FDDD00&color=000000
[Go-url]: https://go.dev/
[Wails.com]: https://img.shields.io/badge/Wails-wails?style=for-the-badge&logo=wails&logoColor=dd3633&color=ffffff
[Wails-url]: https://wails.io/
[Vite.com]: https://img.shields.io/badge/Vite-8bc6fc?style=for-the-badge&logo=vite
[Vite-url]: https://vitejs.dev/
[Tailwind.com]: https://img.shields.io/badge/Tailwind%20CSS-%23399951?style=for-the-badge&logo=tailwindcss
[Tailwind-url]: https://tailwindcss.com/
