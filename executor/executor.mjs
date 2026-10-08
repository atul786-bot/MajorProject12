import { By, until } from "selenium-webdriver";
import { createDriver } from "./driver-factory.mjs";
import { resolveHealingScore } from "./healing-score.mjs";
import config from "./config.mjs";

function resolveByLocator(locatorType, locatorValue) {
  switch (locatorType) {
    case "id":
      return By.id(locatorValue);
    case "css":
      return By.css(locatorValue);
    case "xpath":
      return By.xpath(locatorValue);
    case "name":
      return By.name(locatorValue);
    case "className":
      return By.className(locatorValue);
    default:
      throw new Error(`Unsupported locator type: ${locatorType}`);
  }
}

/**
 * Executes a single dynamic test definition using Selenium WebDriver.
 *
 * @param {Object} testDefinition Test definition object: { testId, name, targetUrl, steps[] }
 * @param {Object} [options={}] Options for execution (e.g. useHealenium)
 * @returns {Promise<Object>} Result object contract: { testId, status, duration, healed, healingScore, message, timestamp }
 */
export async function executeDynamicTest(testDefinition, options = {}) {
  const startTime = Date.now();
  let driver = null;
  let isHealenium = false;
  let healed = false;
  let healingScore = null;
  let message = "Test executed successfully";

  try {
    console.log(`\n========================================`);
    console.log(`Starting execution: ${testDefinition.testId} - ${testDefinition.name}`);
    console.log(`Target URL: ${testDefinition.targetUrl}`);
    console.log(`========================================`);

    const driverContainer = await createDriver(options);
    driver = driverContainer.driver;
    isHealenium = driverContainer.isHealenium;

    // Set implicit timeout
    await driver.manage().setTimeouts({ implicit: config.defaultTimeout });

    for (const step of testDefinition.steps) {
      console.log(`[Step ${step.step}] ${step.action} ${step.locatorType || ''}="${step.locator || ''}" value="${step.value || ''}"`);

      switch (step.action) {
        case "OPEN": {
          let targetUrl = step.value || step.locator || testDefinition.targetUrl;
          if (isHealenium && targetUrl.includes("localhost")) {
            targetUrl = targetUrl.replace("localhost", "host.docker.internal");
          }
          await driver.get(targetUrl);
          break;
        }

        case "TYPE": {
          const locator = resolveByLocator(step.locatorType, step.locator);
          const elem = await driver.wait(until.elementLocated(locator), config.defaultTimeout);
          const tagName = (await elem.getTagName()).toLowerCase();
          if (tagName === "select") {
            await elem.sendKeys(step.value || "");
          } else {
            try {
              await elem.clear();
            } catch (clearErr) {
              // Ignore clear error if non-clearable input
            }
            await elem.sendKeys(step.value || "");
          }
          break;
        }

        case "CLICK": {
          const locator = resolveByLocator(step.locatorType, step.locator);
          let elem;
          try {
            elem = await driver.findElement(locator);
          } catch (err) {
            elem = await driver.wait(until.elementLocated(locator), config.defaultTimeout);
          }
          await elem.click();
          break;
        }

        case "VERIFY": {
          const locator = resolveByLocator(step.locatorType, step.locator);
          const elem = await driver.wait(until.elementLocated(locator), config.defaultTimeout);
          const isDisplayed = await elem.isDisplayed();

          if (!isDisplayed) {
            throw new Error(`Verification failed: Element ${step.locatorType}="${step.locator}" is not displayed.`);
          }

          if (step.value) {
            const actualText = await elem.getText();
            if (!actualText.includes(step.value)) {
              throw new Error(`Verification failed: Expected text containing "${step.value}", but found "${actualText}".`);
            }
          }
          break;
        }

        default:
          console.warn(`Warning: Action "${step.action}" is not supported. Skipping.`);
      }
    }

    // Check healing score if executed via Healenium proxy
    if (isHealenium) {
      for (const step of testDefinition.steps) {
        if (step.locator && step.locatorType) {
          const scoreInfo = await resolveHealingScore({
            locatorType: step.locatorType,
            locatorValue: step.locator,
            url: testDefinition.targetUrl
          });

          if (scoreInfo.healed) {
            healed = true;
            healingScore = scoreInfo.healingScore;
            message = `Test healed by Healenium (Score: ${healingScore})`;
            break;
          }
        }
      }
    }

    const duration = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    console.log(`Status: PASSED | Duration: ${duration}s | Healed: ${healed}`);

    return {
      testId: testDefinition.testId,
      status: "passed",
      duration,
      healed,
      healingScore,
      message,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    const duration = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    console.error(`Status: FAILED | Error: ${err.message}`);

    return {
      testId: testDefinition.testId,
      status: "failed",
      duration,
      healed: false,
      healingScore: null,
      message: err.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    if (driver) {
      try {
        await driver.quit();
      } catch (cleanupErr) {
        // ignore driver quit errors
      }
    }
  }
}
