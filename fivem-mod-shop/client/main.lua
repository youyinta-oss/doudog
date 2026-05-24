local isOpen = false
local playerCoins = 0
local ownedMods = {}
local equippedMod = nil
local allMods = {}

RegisterNetEvent('modshop:client:OpenShop')
AddEventHandler('modshop:client:OpenShop', function()
    OpenShopUI()
end)

RegisterNetEvent('modshop:client:PlayerData')
AddEventHandler('modshop:client:PlayerData', function(data)
    playerCoins = data.coins
    ownedMods = data.ownedMods
    equippedMod = data.equippedMod
    
    if isOpen then
        SendNUIMessage({
            type = 'updateData',
            data = {
                coins = playerCoins,
                ownedMods = ownedMods,
                equippedMod = equippedMod
            }
        })
    end
end)

RegisterNetEvent('modshop:client:ModsList')
AddEventHandler('modshop:client:ModsList', function(mods)
    allMods = mods
    
    if isOpen then
        SendNUIMessage({
            type = 'updateMods',
            data = mods
        })
    end
end)

RegisterNetEvent('modshop:client:Notification')
AddEventHandler('modshop:client:Notification', function(message, type)
    SendNUIMessage({
        type = 'notification',
        data = {
            message = message,
            type = type
        }
    })
end)

function OpenShopUI()
    if isOpen then return end
    
    isOpen = true
    SetNuiFocus(true, true)
    
    TriggerServerEvent('modshop:server:GetMods')
    
    SendNUIMessage({
        type = 'openShop',
        data = {
            playerName = GetPlayerName(PlayerId()),
            coins = playerCoins,
            ownedMods = ownedMods,
            equippedMod = equippedMod,
            mods = allMods,
            categories = Config.Categories
        }
    })
end

function CloseShopUI()
    if not isOpen then return end
    
    isOpen = false
    SetNuiFocus(false, false)
    
    SendNUIMessage({
        type = 'closeShop'
    })
end

function ApplyCharacterMod(modelName)
    local playerPed = PlayerPedId()
    
    RequestModel(modelName)
    
    local timeout = 0
    while not HasModelLoaded(modelName) and timeout < 5000 do
        Wait(50)
        timeout = timeout + 50
    end
    
    if HasModelLoaded(modelName) then
        SetPlayerModel(PlayerId(), modelName)
        SetModelAsNoLongerNeeded(modelName)
        
        SetPedDefaultComponentVariation(PlayerPedId())
    end
end

RegisterNUICallback('closeShop', function(data, cb)
    CloseShopUI()
    cb({ok = true})
end)

RegisterNUICallback('buyMod', function(data, cb)
    TriggerServerEvent('modshop:server:BuyMod', data.modId)
    cb({ok = true})
end)

RegisterNUICallback('equipMod', function(data, cb)
    TriggerServerEvent('modshop:server:EquipMod', data.modId)
    
    for _, mod in ipairs(allMods) do
        if mod.id == data.modId then
            ApplyCharacterMod(mod.model)
            break
        end
    end
    
    cb({ok = true})
end)

RegisterNUICallback('unequipMod', function(data, cb)
    TriggerServerEvent('modshop:server:EquipMod', nil)
    
    local playerPed = PlayerPedId()
    SetPlayerModel(PlayerId(), GetHashKey('mp_m_freemode_01'))
    SetPedDefaultComponentVariation(PlayerPedId())
    
    cb({ok = true})
end)

RegisterCommand(Config.OpenCommand, function()
    TriggerServerEvent('modshop:server:LoadPlayer')
    Wait(500)
    OpenShopUI()
end)

RegisterKeyMapping(Config.OpenCommand, '打开Mod商店', 'keyboard', Config.OpenKey)

RegisterNetEvent('onClientResourceStart')
AddEventHandler('onClientResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        TriggerServerEvent('modshop:server:LoadPlayer')
    end
end)
