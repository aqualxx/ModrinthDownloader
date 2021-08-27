const fs = require('fs');
const fetch = require('node-fetch');
const https = require('https');
const chalk = require('chalk');
var incompatableMods = []

// config
var modScan = 200 // current maximum: 200. only scans (modScan) mods and doesn't download mods that are incompatible, meaning the final total of mods may be less than (modScan) mods.
var DOWNLOAD_DIR = './mods/'; // the directory to put the downloaded mods in
var mod_versions = ["1.17.1", "1.17"] // the Minecraft game version(s) you want
var loader = 'fabric' // set to be 'fabric' or 'forge' depending on what loader you are using
// end config

// if a mods folder doesn't exist, make one, or do nothing if there is already a mods folder
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdir(DOWNLOAD_DIR, function (err, stdout, stderr) {
        if (err) {
            throw chalk.red(err)
        }
        console.log(DOWNLOAD_DIR + " directory made")
    });
} else {
    console.log("Directory" + DOWNLOAD_DIR + "exists")
}

// Function for downloading a file
var download_file = function(file_url, file_name) {
    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name); // set file name

    https.get(file_url, function(res) {
        res.on('data', function(data) {
            file.write(data); // write data provided to the file
        }).on('end', function() {
            file.end(); // finish writing the file
            console.log(chalk.cyan(file_name + ' downloaded to ' + DOWNLOAD_DIR));
        });
    });
};

// Function to start downloading mods with a limit and an offset
function download_mods(limit, offset) {
    return new Promise(async resolveeeeeeeeee => {
        await fetch('https://api.modrinth.com/api/v1/mod?limit=' + limit + '&offset=' + offset).then(res => res.json()).then(data => {
            data.hits.forEach(element => {
                var canUse = false
                // check if the mod fits the version requirements
                mod_versions.forEach(thing => {
                    if (element.latest_version == thing) canUse = true
                });
                if (canUse) {
                    console.log(chalk.green(element.title + " has support for 1.17!"))
                    var id = element.mod_id
                    id = id.replace("local-", "")
                    fetch('https://api.modrinth.com/api/v1/mod/' + id + '/version').then(res => res.json()).then(res => {
                        var has_this_loader = false;
                        // check if it supports the mod loader that is set
                        for (let i = 0; i < res.length; i++) {
                            const aaa = res[i];
                            if (aaa.loaders.includes(loader)) {
                                var url = aaa.files[0].url
                                var filename = aaa.files[0].filename
                                download_file(url, filename)
                                has_this_loader = true
                                break;
                            }
                        }
                        if (!has_this_loader) {
                            incompatableMods.push(element.title)
                        }
                    }).catch(err => {
                        console.log(chalk.red("Can't find details for the mod " + element.title))
                    })
                    return
                } else {
                    incompatableMods.push(element.title)
                }
            });
            console.log("\n")
        });
        resolveeeeeeeeee();
    })
}

async function start() {
    // check if modscan/2 is a whole number
    if (modScan / 2 % 1 == 0) {
        download_mods(modScan / 2, 0)
        await download_mods(modScan / 2, modScan / 2)
    } else {
        // remove leftover
        download_mods((modScan / 2) + 0.5, 0)
        await download_mods((modScan / 2) - 0.5, (modScan / 2) + 0.5)
    }
    // List all the incompatible mods
    console.log(chalk.yellow("The mods " + incompatableMods.join(", ") + " didn't have the right versions, didn't support your loader, or had an error.\n"))
}

start()