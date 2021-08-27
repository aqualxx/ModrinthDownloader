const fetch = require('node-fetch');

fetch('https://api.modrinth.com/api/v1/mod/n9mFA0ax/version').then(res => res.json()).then(res => {
    console.log(res)
    var has_fabric = false;
    for (let i = 0; i < res.length; i++) {
        const aaa = res[i];
        if (aaa.loaders.includes('fabric')) {
            var url = aaa.files[0].url
            var filename = aaa.files[0].filename
            download_file(url, filename)
        }
    }
    if (!has_fabric) {
        console.log("imagine if "+element.title+" was a forge mod hmmmm")
    }
})