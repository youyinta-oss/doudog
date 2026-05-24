fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'FiveM二手车行管理系统'
version '1.0.0'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'locales/zh.lua',
    'framework/adapter.lua',
    'server/database.lua',
    'server/dealership.lua',
    'server/main.lua'
}

client_scripts {
    'client/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/assets/**'
}

dependencies {
    'ox_lib',
    'oxmysql'
}
