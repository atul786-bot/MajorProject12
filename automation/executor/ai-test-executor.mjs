import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const AI_OUTPUT_PATH = path.join(
    PROJECT_ROOT,
    "ai",
    "data",
    "processed",
    "prioritized_tests.json"
);

const RUNNER_PATH = path.join(
    PROJECT_ROOT,
    "automation",
    "executor",
    "ai-jasmine-runner.mjs"
);

/*
 * Legacy test registry.
 *
 * These entries referenced spec files that have been removed
 * from the repository (tests/basic/healenium-connection.spec.mjs,
 * tests/basic/smoke.spec.mjs).
 *
 * Dynamic test execution now goes through executeDynamicTest(),
 * which accepts a test definition object with steps at runtime.
 */
const TEST_REGISTRY = {};

export function loadPrioritizedTests() {
    if (!fs.existsSync(AI_OUTPUT_PATH)) {
        throw new Error(
            `AI prediction file not found: ${AI_OUTPUT_PATH}`
        );
    }

    const data = JSON.parse(
        fs.readFileSync(AI_OUTPUT_PATH, "utf-8")
    );

    return (data.tests ?? []).sort(
        (a, b) => a.priority - b.priority
    );
}

export function getPrioritizedTestIds() {
    return loadPrioritizedTests().map(
        test => test.test_id
    );
}

export function getTestDefinition(testId) {
    const definition = TEST_REGISTRY[testId];

    if (!definition) {
        throw new Error(
            `No test registry entry found for test ID: ${testId}`
        );
    }

    return definition;
}

function getLatestTestResult(testId) {
    const resultsPath = path.join(
        PROJECT_ROOT,
        "automation",
        "results",
        "test-results.json"
    );

    if (!fs.existsSync(resultsPath)) {
        return null;
    }

    const data = JSON.parse(
        fs.readFileSync(resultsPath, "utf-8")
    );

    const matchingResults = (data.tests ?? [])
        .filter(result => result.testId === testId)
        .sort(
            (a, b) =>
                new Date(b.timestamp) -
                new Date(a.timestamp)
        );

    return matchingResults[0] ?? null;
}




function runSingleTest(definition, testId) {
    return new Promise((resolve) => {
        const child = spawn(
            process.execPath,
            [
                RUNNER_PATH,
                definition.file,
                definition.description
            ],
            {
                cwd: PROJECT_ROOT,
                stdio: "inherit",
                env: process.env
            }
        );

        child.on("error", (error) => {
            console.error("Test process error:", error.message);
            resolve(false);
        });

        child.on("close", (code) => {
            const result = getLatestTestResult(testId);

            if (result) {
                resolve(result);
                return;
            }

            resolve({
                testId,
                status: code === 0 ? "passed" : "failed",
                duration: null,
                healed: false,
                healingScore: null
            });
        });
    });
}

export async function executePrioritizedTests() {
    const tests = loadPrioritizedTests();

    console.log("\nAI Prioritized Test Execution");
    console.log("================================");

    const executionSummary = [];

    for (const test of tests) {
        const definition = getTestDefinition(test.test_id);

        console.log(
            `\nPriority ${test.priority}: ${test.test_id}`
        );

        console.log(
            `Failure probability: ${(test.failure_probability * 100).toFixed(2)}%`
        );

        console.log(
            `Risk level: ${test.risk_level}`
        );

        console.log(
            `Executing: ${definition.description}`
        );

        try {
            const passed = await runSingleTest(definition, test.test_id);

            const status = passed ? "passed" : "failed";

            executionSummary.push({
                testId: test.test_id,
                priority: test.priority,
                status
            });

            console.log(
                `Completed ${test.test_id}: ${status}`
            );
        } catch (error) {
            executionSummary.push({
                testId: test.test_id,
                priority: test.priority,
                status: "failed"
            });

            console.error(
                `Completed ${test.test_id}: failed`
            );

            console.error(error.message);
        }
    }

    console.log("\nAI Execution Summary");
    console.log("====================");

    for (const result of executionSummary) {
        console.log(
            `Priority ${result.priority}: ${result.testId} -> ${result.status}`
        );
    }

    return executionSummary;
}

export async function executeSingleTest(testId) {
    const definition = getTestDefinition(testId);

    console.log(
        `\nExecuting adaptive test: ${testId}`
    );

    return await runSingleTest(definition, testId);
}

export async function executeSelectedTests(testIds) {
    const executionSummary = [];

    for (const testId of testIds) {
        const definition = getTestDefinition(testId);

        console.log(
            `\nExecuting selected test: ${testId}`
        );

        try {
            const passed = await runSingleTest(definition, testId);

            executionSummary.push({
                testId,
                status: passed ? "passed" : "failed"
            });
        } catch (error) {
            executionSummary.push({
                testId,
                status: "failed",
                error: error.message
            });
        }
    }

    return executionSummary;
}

/**
 * Execute a dynamic test definition received from the backend.
 *
 * Accepts a test definition object with:
 *   { testId, name, targetUrl, description, steps[] }
 *
 * Each step has: { action, locatorType, locator, value }
 *
 * Returns: { testId, status, duration, healed, healingScore, timestamp, error? }
 */
export async function executeDynamicTest(testDefinition) {
    const { Builder, By } = await import("selenium-webdriver");
    const config = (await import("../config/framework-config.mjs")).default;

    const startTime = Date.now();
    let driver = null;
    let healed = false;
    let healingScore = null;

    try {
        console.log(
            `\nExecuting dynamic test: ${testDefinition.testId}`
        );
        console.log(`Target URL: ${testDefinition.targetUrl}`);

        driver = await new Builder()
            .forBrowser(config.browser)
            .usingServer(config.healeniumUrl)
            .build();

        for (const step of testDefinition.steps) {
            switch (step.action) {
                case "OPEN":
                    await driver.get(
                        step.value || testDefinition.targetUrl
                    );
                    break;

                case "TYPE": {
                    const typeLocator = resolveLocator(
                        By, step.locatorType, step.locator
                    );
                    const typeElement = await driver.findElement(typeLocator);
                    await typeElement.clear();
                    await typeElement.sendKeys(step.value || "");
                    break;
                }

                case "CLICK": {
                    const clickLocator = resolveLocator(
                        By, step.locatorType, step.locator
                    );
                    const clickElement = await driver.findElement(clickLocator);
                    await clickElement.click();
                    break;
                }

                case "VERIFY": {
                    const verifyLocator = resolveLocator(
                        By, step.locatorType, step.locator
                    );
                    const verifyElement = await driver.findElement(verifyLocator);
                    const isDisplayed = await verifyElement.isDisplayed();

                    if (!isDisplayed) {
                        throw new Error(
                            `Verification failed: element not displayed ` +
                            `(${step.locatorType}=${step.locator})`
                        );
                    }

                    if (step.value) {
                        const text = await verifyElement.getText();

                        if (!text.includes(step.value)) {
                            throw new Error(
                                `Verification failed: expected "${step.value}" ` +
                                `but got "${text}"`
                            );
                        }
                    }
                    break;
                }

                default:
                    console.warn(
                        `Unknown step action: ${step.action}`
                    );
            }
        }

        const duration = (Date.now() - startTime) / 1000;

        return {
            testId: testDefinition.testId,
            status: "passed",
            duration,
            healed,
            healingScore,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        const duration = (Date.now() - startTime) / 1000;

        return {
            testId: testDefinition.testId,
            status: "failed",
            duration,
            healed,
            healingScore,
            timestamp: new Date().toISOString(),
            error: error.message
        };
    } finally {
        if (driver) {
            try {
                await driver.quit();
            } catch {
                // Ignore driver cleanup errors.
            }
        }
    }
}

function resolveLocator(By, locatorType, locatorValue) {
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
            throw new Error(
                `Unsupported locator type: ${locatorType}`
            );
    }
}
