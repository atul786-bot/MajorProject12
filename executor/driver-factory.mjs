import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import config from "./config.mjs";

/**
 * Creates a Selenium WebDriver instance.
 * Automatically tries Healenium proxy on port 8085 first (if requested or enabled),
 * and falls back to direct local ChromeDriver if proxy is unreachable.
 *
 * @param {Object} options
 * @param {boolean} [options.useHealenium=true] Whether to use Healenium proxy
 * @returns {Promise<{ driver: import('selenium-webdriver').WebDriver, isHealenium: boolean }>}
 */
export async function createDriver(options = {}) {
  const { useHealenium = true } = options;

  const chromeOptions = new chrome.Options();
  if (config.headless) {
    chromeOptions.addArguments("--headless=new");
  }
  chromeOptions.addArguments("--no-sandbox");
  chromeOptions.addArguments("--disable-dev-shm-usage");
  chromeOptions.addArguments("--disable-gpu");

  if (useHealenium) {
    try {
      console.log(`Connecting to Healenium proxy at: ${config.healeniumUrl}`);
      const driver = await new Builder()
        .forBrowser(config.browser)
        .setChromeOptions(chromeOptions)
        .usingServer(config.healeniumUrl)
        .build();

      return { driver, isHealenium: true };
    } catch (err) {
      console.warn(`Healenium proxy unavailable (${err.message}). Falling back to local direct Chrome WebDriver...`);
    }
  }

  console.log("Starting direct local Chrome WebDriver...");
  const driver = await new Builder()
    .forBrowser(config.browser)
    .setChromeOptions(chromeOptions)
    .build();

  return { driver, isHealenium: false };
}
