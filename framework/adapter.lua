Framework = {}

function Framework.GetPlayerIdentifier(source)
    if Config.Framework == 'ESX' then
        local xPlayer = ESX.GetPlayerFromId(source)
        if xPlayer then
            return xPlayer.identifier
        end
    elseif Config.Framework == 'QBCore' then
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return Player.PlayerData.citizenid
        end
    end
    return nil
end

function Framework.GetPlayer(source)
    if Config.Framework == 'ESX' then
        return ESX.GetPlayerFromId(source)
    elseif Config.Framework == 'QBCore' then
        return QBCore.Functions.GetPlayer(source)
    end
    return nil
end

function Framework.GetPlayerMoney(source, moneyType)
    local xPlayer = Framework.GetPlayer(source)
    if not xPlayer then return 0 end

    if Config.Framework == 'ESX' then
        return xPlayer.getAccount(moneyType or 'money').money
    elseif Config.Framework == 'QBCore' then
        local moneyTypeMap = {
            ['cash'] = 'cash',
            ['bank'] = 'bank',
            ['money'] = 'cash'
        }
        return xPlayer.PlayerData.money[moneyTypeMap[moneyType] or 'cash'] or 0
    end
    return 0
end

function Framework.RemoveMoney(source, amount, moneyType)
    local xPlayer = Framework.GetPlayer(source)
    if not xPlayer then return false end

    if Config.Framework == 'ESX' then
        if moneyType == 'bank' then
            xPlayer.removeAccountMoney('bank', amount)
        else
            xPlayer.removeMoney(amount)
        end
        return true
    elseif Config.Framework == 'QBCore' then
        if moneyType == 'bank' then
            xPlayer.Functions.RemoveMoney('bank', amount)
        else
            xPlayer.Functions.RemoveMoney('cash', amount)
        end
        return true
    end
    return false
end

function Framework.AddMoney(source, amount, moneyType)
    local xPlayer = Framework.GetPlayer(source)
    if not xPlayer then return false end

    if Config.Framework == 'ESX' then
        if moneyType == 'bank' then
            xPlayer.addAccountMoney('bank', amount)
        else
            xPlayer.addMoney(amount)
        end
        return true
    elseif Config.Framework == 'QBCore' then
        if moneyType == 'bank' then
            xPlayer.Functions.AddMoney('bank', amount)
        else
            xPlayer.Functions.AddMoney('cash', amount)
        end
        return true
    end
    return false
end

function Framework.GetPlayerVehicles(source)
    local vehicles = {}
    local identifier = Framework.GetPlayerIdentifier(source)

    if Config.Framework == 'ESX' then
        local result = MySQL.query.await('SELECT * FROM owned_vehicles WHERE owner = ?', {identifier})
        if result then
            for _, vehicle in ipairs(result) do
                table.insert(vehicles, {
                    plate = vehicle.plate,
                    model = vehicle.model,
                    props = json.decode(vehicle.props)
                })
            end
        end
    elseif Config.Framework == 'QBCore' then
        local result = MySQL.query.await('SELECT * FROM player_vehicles WHERE citizenid = ?', {identifier})
        if result then
            for _, vehicle in ipairs(result) do
                table.insert(vehicles, {
                    plate = vehicle.plate,
                    model = vehicle.vehicle,
                    mods = json.decode(vehicle.mods)
                })
            end
        end
    end

    return vehicles
end

function Framework.IsVehicleOwnedBy(source, plate)
    local identifier = Framework.GetPlayerIdentifier(source)
    if not identifier then return false end

    if Config.Framework == 'ESX' then
        local result = MySQL.query.await('SELECT * FROM owned_vehicles WHERE owner = ? AND plate = ?', {identifier, plate})
        return result and #result > 0
    elseif Config.Framework == 'QBCore' then
        local result = MySQL.query.await('SELECT * FROM player_vehicles WHERE citizenid = ? AND plate = ?', {identifier, plate})
        return result and #result > 0
    end
    return false
end

function Framework.RemoveVehicle(plate)
    if Config.Framework == 'ESX' then
        MySQL.update('DELETE FROM owned_vehicles WHERE plate = ?', {plate})
    elseif Config.Framework == 'QBCore' then
        MySQL.update('DELETE FROM player_vehicles WHERE plate = ?', {plate})
    end
end

function Framework.GiveVehicle(source, plate, vehicleProps)
    local identifier = Framework.GetPlayerIdentifier(source)
    if not identifier then return false end

    if Config.Framework == 'ESX' then
        MySQL.insert('INSERT INTO owned_vehicles (owner, plate, vehicle, props) VALUES (?, ?, ?, ?)',
            {identifier, plate, vehicleProps.model or vehicleProps.hash or GetDisplayNameFromVehicleModel(vehicleProps.model or vehicleProps.hash), json.encode(vehicleProps)})
        return true
    elseif Config.Framework == 'QBCore' then
        MySQL.insert('INSERT INTO player_vehicles (citizenid, plate, vehicle, mods) VALUES (?, ?, ?, ?)',
            {identifier, plate, vehicleProps.model or vehicleProps.hash, json.encode(vehicleProps)})
        return true
    end
    return false
end

function Framework.GetVehicleLabel(model)
    if Config.Framework == 'ESX' then
        local vehicles = Config.Vehicles or {}
        for _, v in ipairs(vehicles) do
            if v.model == model then
                return v.name
            end
        end
    elseif Config.Framework == 'QBCore' then
        if QBCore and QBCore.Shared and QBCore.Shared.Vehicles then
            local vehicle = QBCore.Shared.Vehicles[model]
            if vehicle then
                return vehicle.name
            end
        end
    end

    local displayName = GetDisplayNameFromVehicleModel(model)
    return displayName ~= 'CARNOTFOUND' and displayName or model
end

function Framework.Notify(source, message, type)
    type = type or 'info'

    if Config.Framework == 'ESX' then
        TriggerClientEvent('esx:showNotification', source, message)
    elseif Config.Framework == 'QBCore' then
        TriggerClientEvent('QBCore:Notify', source, message, type)
    end
end

function Framework.RegisterUsableItem(itemName, callback)
    if Config.Framework == 'ESX' then
        ESX.RegisterUsableItem(itemName, callback)
    elseif Config.Framework == 'QBCore' then
        QBCore.Functions.CreateUseableItem(itemName, callback)
    end
end

function Framework.IsOwner(identifier)
    for _, owner in ipairs(Config.Owners) do
        if owner == identifier then
            return true
        end
    end
    return false
end

return Framework
