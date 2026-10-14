import pg from "pg";
import config from "./config.mjs";

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: config.healeniumDb.host,
      port: config.healeniumDb.port,
      user: config.healeniumDb.user,
      password: config.healeniumDb.password,
      database: config.healeniumDb.database,
      allowExitOnIdle: true,
      connectionTimeoutMillis: 3000
    });
  }
  return pool;
}

/**
 * Returns the maximum healing_result ID currently recorded in Healenium's database.
 * Used as a baseline before test execution to ensure only healings occurring
 * during the current test run are counted.
 */
export async function getMaxHealingId() {
  try {
    const p = getPool();
    const res = await p.query("SELECT COALESCE(MAX(id), 0) AS max_id FROM healenium.healing_result");
    return Number(res.rows[0].max_id) || 0;
  } catch (err) {
    return 0;
  }
}

export async function resolveHealingScore(locatorInfo) {
  try {
    const p = getPool();
    const { locatorType, locatorValue, command = "findElement", url = "", minHealingId = 0 } = locatorInfo;

    const locatorTypeMap = {
      id: "By.cssSelector",
      css: "By.cssSelector",
      className: "By.cssSelector",
      name: "By.cssSelector",
      xpath: "By.xpath"
    };

    let healeniumValue = locatorValue;
    if (locatorType === "id") healeniumValue = `*[id="${locatorValue}"]`;
    if (locatorType === "className") healeniumValue = `.${locatorValue}`;
    if (locatorType === "name") healeniumValue = `*[name="${locatorValue}"]`;

    const healeniumType = locatorTypeMap[locatorType];
    if (!healeniumType || !locatorValue) {
      return { healed: false, healingScore: null };
    }

    const selRes = await p.query(
      `SELECT uid FROM healenium.selector 
       WHERE locator::jsonb ->> 'type' = $1 
         AND locator::jsonb ->> 'value' = $2 
       ORDER BY create_date DESC LIMIT 1`,
      [healeniumType, healeniumValue]
    );

    if (selRes.rows.length === 0) {
      return { healed: false, healingScore: null };
    }

    const selectorId = selRes.rows[0].uid;

    let queryText = `
      SELECT hr.id, hr.score 
      FROM healenium.healing_result hr 
      JOIN healenium.healing h ON hr.healing_id = h.uid 
      WHERE h.selector_id = $1 AND hr.success_healing = true
    `;
    const queryParams = [selectorId];

    if (minHealingId && minHealingId > 0) {
      queryText += ` AND hr.id > $2 ORDER BY hr.id DESC LIMIT 1`;
      queryParams.push(minHealingId);
    } else {
      queryText += ` ORDER BY hr.id DESC LIMIT 1`;
    }

    const healRes = await p.query(queryText, queryParams);

    if (healRes.rows.length > 0) {
      return { healed: true, healingScore: Number(healRes.rows[0].score) };
    }

    return { healed: false, healingScore: null };
  } catch (err) {
    // Return non-healed gracefully if DB is not reachable
    return { healed: false, healingScore: null };
  }
}
