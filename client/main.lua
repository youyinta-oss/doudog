local DealershipBlip = nil
local ShowroomVehicles = {}

function OpenDealershipUI()
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = 'open'
    })
end

function CloseDealershipUI()
    SetNuiFocus(false, false)
    SendNUIMessage({
        type = 'close'
    })
end

RegisterNetEvent('dealership:openUI', function(dealership)
    OpenDealershipUI()
    SendNUIMessage({
        type = 'setDealership',
        data = dealership
    })
end)

RegisterNetEvent('dealership:update', function(dealership)
    SendNUIMessage({
        type = 'setDealership',
        data = dealership
    })
end)

RegisterNetEvent('dealership:inventory', function(inventory)
    SendNUIMessage({
        type = 'setInventory',
        data = inventory
    })
end)

RegisterNetEvent('dealership:showroom', function(showroom)
    SendNUIMessage({
        type = 'setShowroom',
        data = showroom
    })

    for _, slot in ipairs(showroom) do
        if slot.inventory_id and slot.coords then
            local coords = json.decode(slot.coords)
            if coords then
                SpawnShowroomVehicle(slot.inventory_id, coords, slot.heading)
            end
        end
    end
end)

RegisterNetEvent('dealership:account', function(account)
    SendNUIMessage({
        type = 'setAccount',
        data = account
    })
end)

RegisterNetEvent('dealership:transactions', function(transactions)
    SendNUIMessage({
        type = 'setTransactions',
        data = transactions
    })
end)

RegisterNetEvent('dealership:playerVehicles', function(vehicles)
    SendNUIMessage({
        type = 'setPlayerVehicles',
        data = vehicles
    })
end)

RegisterNUICallback('close', function(data, cb)
    CloseDealershipUI()
    cb('ok')
end)

RegisterNUICallback('getInventory', function(data, cb)
    TriggerServerEvent('dealership:getInventory')
    cb('ok')
end)

RegisterNUICallback('getShowroom', function(data, cb)
    TriggerServerEvent('dealership:getShowroom')
    cb('ok')
end)

RegisterNUICallback('getAccount', function(data, cb)
    TriggerServerEvent('dealership:getAccount')
    cb('ok')
end)

RegisterNUICallback('getTransactions', function(data, cb)
    TriggerServerEvent('dealership:getTransactions')
    cb('ok')
end)

RegisterNUICallback('getPlayerVehicles', function(data, cb)
    TriggerServerEvent('dealership:getPlayerVehicles')
    cb('ok')
end)

RegisterNUICallback('updatePrice', function(data, cb)
    TriggerServerEvent('dealership:updatePrice', data.inventoryId, data.price)
    cb('ok')
end)

RegisterNUICallback('addToShowroom', function(data, cb)
    local coords = GetEntityCoords(GetVehiclePedIsIn(PlayerPedId(), false))
    local heading = GetEntityHeading(GetVehiclePedIsIn(PlayerPedId(), false))
    TriggerServerEvent('dealership:addToShowroom', data.slotId, data.inventoryId, coords, heading)
    cb('ok')
end)

RegisterNUICallback('removeFromShowroom', function(data, cb)
    TriggerServerEvent('dealership:removeFromShowroom', data.slotId)
    cb('ok')
end)

RegisterNUICallback('deposit', function(data, cb)
    TriggerServerEvent('dealership:deposit', data.amount, data.moneyType)
    cb('ok')
end)

RegisterNUICallback('withdraw', function(data, cb)
    TriggerServerEvent('dealership:withdraw', data.amount)
    cb('ok')
end)

RegisterNUICallback('uploadVehicle', function(data, cb)
    TriggerServerEvent('dealership:uploadVehicle', data.plate)
    cb('ok')
end)

RegisterNUICallback('purchaseVehicle', function(data, cb)
    TriggerServerEvent('dealership:purchaseVehicle', data.targetSource, data.plate, data.price)
    cb('ok')
end)

RegisterCommand('dealership', function()
    TriggerServerEvent('dealership:open')
end)

RegisterKeyMapping('dealership', '打开二手车行', 'keyboard', 'F5')

function SpawnShowroomVehicle(inventoryId, coords, heading)
    if ShowroomVehicles[inventoryId] then
        DeleteVehicle(ShowroomVehicles[inventoryId])
    end

    MySQL.query('SELECT props FROM dealer_inventory WHERE id = ?', {inventoryId}, function(results)
        if results and #results > 0 then
            local props = json.decode(results[1].props)
            local hash = GetHashKey(props.model or props.hash)

            RequestModel(hash)
            while not HasModelLoaded(hash) do
                Wait(100)
            end

            local vehicle = CreateVehicle(hash, coords.x, coords.y, coords.z, heading, false, false)
            SetEntityAsNoLongerNeeded(vehicle)
            SetVehicleDoorsLocked(vehicle, 3)

            ShowroomVehicles[inventoryId] = vehicle
        end
    end)
end

CreateThread(function()
    while true do
        Wait(1000)
    end
end)
