local MOD_SHOP_OPEN = false
local currentEquippedModel = nil
local apiUrl = 'http://localhost:3001/api'

RegisterNetEvent('modshop:open')
AddEventHandler('modshop:open', function()
    OpenModShop()
end)

RegisterNetEvent('modshop:close')
AddEventHandler('modshop:close', function()
    CloseModShop()
end)

RegisterNetEvent('modshop:applyModel')
AddEventHandler('modshop:applyModel', function(modelPath)
    ApplyCharacterMod(modelPath)
end)

RegisterNetEvent('modshop:notification')
AddEventHandler('modshop:notification', function(message, type)
    ShowNotification(message, type)
end)

function OpenModShop()
    if MOD_SHOP_OPEN then return end
    
    MOD_SHOP_OPEN = true
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = 'openShop',
        data = {
            playerId = GetPlayerServerId(PlayerId()),
            playerName = GetPlayerName(PlayerId())
        }
    })
    
    CreateThread(function()
        while MOD_SHOP_OPEN do
            Wait(0)
            DisableAllControlActions(0)
        end
    end)
end

function CloseModShop()
    if not MOD_SHOP_OPEN then return end
    
    MOD_SHOP_OPEN = false
    SetNuiFocus(false, false)
    
    SendNUIMessage({
        type = 'closeShop'
    })
end

function ApplyCharacterMod(modelPath)
    local playerPed = PlayerPedId()
    
    RequestModel(modelPath)
    
    local timeout = 0
    while not HasModelLoaded(modelPath) and timeout < 1000 do
        Wait(10)
        timeout = timeout + 10
    end
    
    if HasModelLoaded(modelPath) then
        SetPlayerModel(PlayerId(), modelPath)
        SetModelAsNoLongerNeeded(modelPath)
        currentEquippedModel = modelPath
        
        ShowNotification('人物Mod已应用: ' .. modelPath, 'success')
        
        TriggerServerEvent('modshop:modelApplied', modelPath)
    else
        ShowNotification('模型加载失败', 'error')
    end
end

function ShowNotification(message, type)
    SetNotificationTextEntry('STRING')
    AddTextComponentString(message)
    
    local notificationType = 2
    if type == 'success' then
        notificationType = 2
    elseif type == 'error' then
        notificationType = 0
    end
    
    DrawNotification(notificationType, true)
end

RegisterNUICallback('closeShop', function(data, cb)
    CloseModShop()
    cb('ok')
end)

RegisterNUICallback('purchaseMod', function(data, cb)
    local playerId = GetPlayerServerId(PlayerId())
    
    local response = FetchWithRetry(apiUrl .. '/user/license:player_' .. playerId .. '/buy-mod', {
        method = 'POST',
        headers = {
            ['Content-Type'] = 'application/json'
        },
        body = json.encode({ mod_id = data.modId })
    })
    
    if response and response.success then
        ShowNotification('购买成功！', 'success')
        cb({ success = true, data = response.data })
    else
        ShowNotification(response.error or '购买失败', 'error')
        cb({ success = false, error = response.error })
    end
end)

RegisterNUICallback('equipMod', function(data, cb)
    ApplyCharacterMod(data.modelPath)
    cb({ success = true })
end)

RegisterNUICallback('getPlayerData', function(data, cb)
    local playerId = GetPlayerServerId(PlayerId())
    
    local coinsResponse = FetchWithRetry(apiUrl .. '/user/license:player_' .. playerId .. '/coins')
    local modsResponse = FetchWithRetry(apiUrl .. '/user/license:player_' .. playerId .. '/mods')
    local equippedResponse = FetchWithRetry(apiUrl .. '/user/license:player_' .. playerId .. '/equipped-mod')
    
    cb({
        success = true,
        data = {
            coins = coinsResponse and coinsResponse.data or { coins = 0 },
            mods = modsResponse and modsResponse.data or {},
            equipped = equippedResponse and equippedResponse.data or nil
        }
    })
end)

RegisterNUICallback('getMods', function(data, cb)
    local response = FetchWithRetry(apiUrl .. '/mods')
    cb({
        success = response and response.success or false,
        data = response and response.data or {}
    })
end)

function FetchWithRetry(url, options, retries)
    retries = retries or 3
    
    for i = 1, retries do
        local response = exports.nsrp_lib:fetch(url, options)
        
        if response then
            return response
        end
        
        if i < retries then
            Wait(1000)
        end
    end
    
    return nil
end

RegisterCommand('modshop', function()
    OpenModShop()
end, false)

RegisterKeyMapping('modshop', '打开Mod商店', 'keyboard', 'F5')

CreateThread(function()
    while true do
        Wait(0)
        
        if IsControlJustPressed(0, 166) then
            OpenModShop()
        end
        
        if MOD_SHOP_OPEN and IsControlJustPressed(0, 177) then
            CloseModShop()
        end
    end
end)
