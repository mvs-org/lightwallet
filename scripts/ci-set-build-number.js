var fs = require('fs')
const appServiceFile = './src/app/services/app.service.ts'
fs.readFile(appServiceFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err)
    }
    var result = data.replace(/readonly build = ''/g, `readonly build = '${process.env.TRAVIS_BUILD_NUMBER}'`)

    fs.writeFile(appServiceFile, result, 'utf8', function (err) {
        if (err) return console.log(err)
    })
})