require 'config'
require 'locales/zh'

if Config.Framework == 'ESX' then
    TriggerEvent('esx:getSharedObject', function(obj)
        ESX = obj
    end)
elseif Config.Framework == 'QBCore' then
    QBCore = exports['qb-core']:GetCoreObject()
end

require 'server/database'
Framework = require 'framework/adapter'
require 'server/dealership'

RegisterNetEvent('dealership:ready')
AddEventHandler('dealership:ready', function()
    local source = source
    print('[二手车行] 玩家 ' .. source .. ' 已加载插件')
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        Wait(1000)
        InitializeDatabase()
        print('[二手车行] 资源启动完成')
    end
end)

print('[二手车行] FiveM二手车行插件已加载')
