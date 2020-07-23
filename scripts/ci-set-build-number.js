var fs = require('fs')
const appServiceFile = './src/app/services/app.service.ts'

console.log(`set ci info for build number ${process.env.TRAVIS_BUILD_NUMBER} on ${process.env.TRAVIS_BUILD_WEB_URL}`)
fs.readFile(appServiceFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err)
    }
    var result = data.replace(/readonly ci_number = ''/g, `readonly ci_number = '${process.env.TRAVIS_BUILD_NUMBER}'`)
    result = result.replace(/readonly ci_link = ''/g, `readonly ci_link = '${process.env.TRAVIS_BUILD_WEB_URL}'`)
    result = result.replace(/readonly ci_commit = ''/g, `readonly ci_commit = '${process.env.TRAVIS_COMMIT}'`)

    fs.writeFile(appServiceFile, result, 'utf8', function (err) {
        if (err) return console.log(err)
    })
})