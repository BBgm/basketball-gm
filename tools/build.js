var Promise = require("bluebird");
var execAsync = Promise.promisify(require("child_process").exec);

execAsync("rm -f gen/*").then(function () {
    console.log("Minifying JS...");
    return execAsync("r.js -o baseUrl=js paths.requireLib=lib/require optimize=uglify2 preserveLicenseComments=false generateSourceMaps=true name=app include=requireLib mainConfigFile=js/app.js out=gen/app.js");
}).then(function () {
    console.log("Minifying CSS...");
    return execAsync("cat css/bootstrap.css css/bbgm.css css/bbgm-notifications.css css/DT_bootstrap.css | node_modules/.bin/cleancss -o gen/bbgm.css");
}).then(function () {
    console.log("Setting timestamps...");

    var d = new Date();
    var mins = d.getMinutes() + 60 * d.getHours();

    return Promise.all([
        execAsync('sed -i "s/LAST UPDATED:.*/LAST UPDATED: `date`/" bbgm.appcache'),
        execAsync('sed -i "s/<!--rev-->.*<\\/p>/<!--rev-->`date +"%Y.%m.%d"`.' + mins + '<\\/p>/" index.html'),
        execAsync('sed -i "s/Bugsnag\\.appVersion = \\".*\\"/Bugsnag.appVersion = \\"`date +"%Y.%m.%d"`.' + mins + '\\"/" index.html')
    ]);
}).then(function () {
    if (process.argv.length > 2 && process.argv[2] === "cordova") {
        console.log("Copying and processing files for Cordova...");

        return Promise.all([
            execAsync("cp index.html cordova/index.html"),
            execAsync("cp fonts/* cordova/fonts"),
            execAsync("head -n -1 gen/app.js > cordova/gen/app.js"), // Copy while removing source maps comment
            execAsync("cp gen/bbgm.css cordova/gen/bbgm.css")
        ]);
    }
}).then(function () {
    console.log("DONE!");
});
