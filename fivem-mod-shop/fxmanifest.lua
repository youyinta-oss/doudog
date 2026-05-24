fx_version 'cerulean'
game 'gta5'

name 'FiveM Character Mod Shop'
description '人物Mod商店系统'
version '2.0.0'
author 'Your Name'
license 'MIT'

lua54 'yes'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'config.lua',
    'server/main.lua'
}

client_scripts {
    'config.lua',
    'client/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

dependencies {
    'oxmysql'
}
