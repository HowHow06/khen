# Khen: My Web-Based Tool Suite

Welcome to Khen, a versatile web-based tool suite designed to streamline and enrich your digital tasks. At the heart of Khen lies a commitment to solving real-world problems through the power of programming. The star of the show is our PPT Generator tool, crafted to significantly reduce the time and effort involved in creating PowerPoint presentations for praise and worship songs, making it a game-changer for church services.

## 🌟 Highlight: PPT Generator Tool

Creating PowerPoint presentations for each praise and worship session can be daunting, especially when handling a vast selection of songs. The PPT Generator tool within Khen addresses this challenge head-on, offering a quick and efficient way to generate presentations by simply inserting song lyrics. It's more than just a tool; it's a solution designed to save time, allowing you to focus on the essence of worship.

## 🔧 Features

- **PPT Generator**: Automate the creation of PowerPoint presentations for songs with ease.
- **User-Friendly Interface**: Designed with simplicity in mind, ensuring accessibility for all users.
- **Expandable Suite**: While the PPT Generator takes center stage, Khen is built to grow, with plans to introduce more tools tailored to your needs.

## 🚀 Getting Started

Setting up Khen is straightforward, ensuring you can get up and running with minimal fuss:

1. **Clone the Repository**

```bash
git clone https://github.com/HowHow06/khen.git
```

2. **Installation**

Navigate to the project directory and install the necessary dependencies:

```bash
# Install dependencies
npm install
```

3. **Environment Configuration**

Copy the `.env.example` file to a new file named `.env.local` and update it with your specific configurations:

```bash
cp .env.example .env.local
```

4. **Running the Application**

Launch Khen with the following command:

```bash
npm run start
```

The application will be available at `http://localhost:3000` or the port specified in your `.env` file.

## 📚 Documentation: PPT Generator Tool

For more detailed information on each tool within Khen, including walkthroughs and tips, refer to the [guide](https://season-breeze-210.notion.site/PPT-Control-and-Making-Training-a5a2e6329d5b4e5e871910024d6c6a2e?pvs=4).

## 🙌 Contributing

Khen is a personal passion project, but collaboration is the key to improvement. Whether it's suggesting new features, improving existing tools, or fixing bugs, your contributions are welcome. Feel free to fork the repository and submit pull requests.

---

## Troubleshooting

## Error faced in using jest

- When using yarn v1 with jest, it might be fine on the first `yarn install`. However, when new dependencies are added, the `yarn test` will no longer works.
- As workaround, the code below is added to the `package.json` file
  ```
  "resolutions": {
    "wrap-ansi": "7.0.0",
    "string-width": "4.2.3"
  }
  ```
- OR another workaround is to use `npm` instead of yarn
- OR another workaround is to delete the `yarn.lock` file
- Refer to
  - [\[Bug?\]: Error [ERR_REQUIRE_ESM]: require() of ES Module string-width/index.js](https://github.com/yarnpkg/yarn/issues/8994)
  - [Jest fails to run after installing selenium-webdriver](https://stackoverflow.com/questions/77592704/jest-fails-to-run-after-installing-selenium-webdriver/77592734#77592734)
  - [Error [ERR_REQUIRE_ESM]: require() of ES Module, node_modules\wrap-ansi\index.js not supported](https://stackoverflow.com/questions/77406363/error-err-require-esm-require-of-es-module-node-modules-wrap-ansi-index-js)
