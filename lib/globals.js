/**
 * Guarantees the global identifiers command files rely on (bare `axios`,
 * `config`, `tools.*`, `formatter.*`) are defined — regardless of whether
 * the bot is started via index.js or main.js.
 *
 * Many command files call `axios.get(...)`, `config.msg.footer`,
 * `tools.api.createUrl(...)`, `tools.cmd.handleError(...)` etc. without
 * requiring them, relying on globals that were only partially installed
 * by index.js. This module installs/merges the missing ones from lib/.
 *
 * Existing values (e.g. a tools/exports.js loaded by index.js) are kept.
 */
(function setupGlobals() {
    if (global.__moonsonGlobalsReady) return;
    global.__moonsonGlobalsReady = true;

    // Bare `config` / `axios` used across many command files
    if (!global.config) global.config = require("../config.js");
    if (!global.axios) {
        try { global.axios = require("axios"); } catch (e) { /* installed on the server; never block startup */ }
    }

    const format = require("./format");
    const api = require("./api");
    const helper = require("./helper");

    // tools.* helpers — merge so an existing tools/exports.js stays intact
    if (!global.tools) global.tools = {};
    if (!global.tools.msg) global.tools.msg = {};
    for (const [key, fn] of Object.entries(format)) {
        if (typeof global.tools.msg[key] === "undefined") global.tools.msg[key] = fn;
    }
    if (!global.tools.api) global.tools.api = api;
    if (!global.tools.cmd) global.tools.cmd = helper;

    // formatter (index.js normally installs this; guard for direct main.js runs)
    if (!global.formatter) global.formatter = format;
})();

module.exports = {};
