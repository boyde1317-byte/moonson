const Check = require("./check");
const Permissions = require("./permissions");
const Restrictions = require("./restrictions");
const Track = require("./track");
const AutoReact = require("./autoReact");

module.exports = (bot) => {
    Check(bot);
    Permissions(bot);
    Restrictions(bot);
    AutoReact(bot);
    Track(bot);
};
