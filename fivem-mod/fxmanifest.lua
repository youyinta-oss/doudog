fx_version 'cerulean'
game 'gta5'

name 'FiveM Character Mod System'
description 'A comprehensive character mod management system for FiveM servers'
version '1.0.0'
author 'Your Name'
license 'MIT'

lua54 'yes'

server_scripts {
    'server.lua'
}

client_scripts {
    'client.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

dependencies {
    'es_extended'
}
