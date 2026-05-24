local Dealerships = {}

Dealerships.PlayerDealerships = {}

function Dealerships.GetPlayerDealership(source)
    local identifier = Framework.GetPlayerIdentifier(source)
    if not identifier then return nil end

    if Dealerships.PlayerDealerships[identifier] then
        return Dealerships.PlayerDealerships[identifier]
    end

    return nil
end

function Dealerships.GetOrCreateDealership(source, name)
    local identifier = Framework.GetPlayerIdentifier(source)
    if not identifier then return nil end

    GetDealershipByOwner(identifier, function(dealership)
        if dealership then
            Dealerships.PlayerDealerships[identifier] = dealership
            TriggerClientEvent('dealership:update', source, dealership)
        else
            CreateDealership(identifier, name, function(id)
                if id then
                    GetDealershipByOwner(identifier, function(newDealership)
                        Dealerships.PlayerDealerships[identifier] = newDealership
                        TriggerClientEvent('dealership:update', source, newDealership)
                    end)
                end
            end)
        end
    end)

    return true
end

RegisterNetEvent('dealership:open', function()
    local source = source
    local identifier = Framework.GetPlayerIdentifier(source)

    if not Framework.IsOwner(identifier) then
        Framework.Notify(source, _('<err>你不是车行老板</err>'), 'error')
        return
    end

    local dealership = Dealerships.GetPlayerDealership(source)
    if not dealership then
        Dealerships.GetOrCreateDealership(source, '我的车行')
        return
    end

    TriggerClientEvent('dealership:openUI', source, dealership)
end)

RegisterNetEvent('dealership:getInventory', function()
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        TriggerClientEvent('dealership:inventory', source, {})
        return
    end

    GetInventory(dealership.id, function(inventory)
        for i, v in ipairs(inventory) do
            if v.props then
                inventory[i].props = json.decode(v.props)
            end
            if v.inspection then
                inventory[i].inspection = json.decode(v.inspection)
            end
        end
        TriggerClientEvent('dealership:inventory', source, inventory)
    end)
end)

RegisterNetEvent('dealership:getShowroom', function()
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        TriggerClientEvent('dealership:showroom', source, {})
        return
    end

    GetShowroom(dealership.id, function(showroom)
        for i, v in ipairs(showroom) do
            if v.inspection and v.inspection ~= '' then
                showroom[i].inspection = json.decode(v.inspection)
            end
        end
        TriggerClientEvent('dealership:showroom', source, showroom)
    end)
end)

RegisterNetEvent('dealership:getAccount', function()
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        TriggerClientEvent('dealership:account', source, {balance = 0})
        return
    end

    GetAccountBalance(dealership.id, function(balance)
        TriggerClientEvent('dealership:account', source, {balance = balance})
    end)
end)

RegisterNetEvent('dealership:getTransactions', function()
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        TriggerClientEvent('dealership:transactions', source, {})
        return
    end

    GetTransactions(dealership.id, function(transactions)
        TriggerClientEvent('dealership:transactions', source, transactions)
    end)
end)

RegisterNetEvent('dealership:updatePrice', function(inventoryId, newPrice)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    UpdateVehiclePrice(inventoryId, newPrice, function(success)
        if success then
            Framework.Notify(source, '价格已更新', 'success')
            TriggerEvent('dealership:getInventory', source)
        else
            Framework.Notify(source, '更新失败', 'error')
        end
    end)
end)

RegisterNetEvent('dealership:addToShowroom', function(slotId, inventoryId, coords, heading)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    AssignToShowroom(slotId, inventoryId, json.encode(coords), heading, function(success)
        if success then
            Framework.Notify(source, '已上架到展厅', 'success')
            TriggerEvent('dealership:getShowroom', source)
            TriggerEvent('dealership:getInventory', source)
        else
            Framework.Notify(source, '上架失败', 'error')
        end
    end)
end)

RegisterNetEvent('dealership:removeFromShowroom', function(slotId)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    AssignToShowroom(slotId, nil, nil, 0.0, function(success)
        if success then
            Framework.Notify(source, '已从展厅移除', 'success')
            TriggerEvent('dealership:getShowroom', source)
            TriggerEvent('dealership:getInventory', source)
        else
            Framework.Notify(source, '移除失败', 'error')
        end
    end)
end)

RegisterNetEvent('dealership:deposit', function(amount, moneyType)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    local playerMoney = Framework.GetPlayerMoney(source, moneyType)
    if playerMoney < amount then
        Framework.Notify(source, '金额不足', 'error')
        return
    end

    Framework.RemoveMoney(source, amount, moneyType)
    AddTransaction(dealership.id, 'deposit', amount, '充值', nil, nil, function(txId, newBalance)
        if txId then
            Framework.Notify(source, '充值成功', 'success')
            TriggerEvent('dealership:getAccount', source)
            TriggerEvent('dealership:getTransactions', source)
        else
            Framework.AddMoney(source, amount, moneyType)
            Framework.Notify(source, '充值失败', 'error')
        end
    end)
end)

RegisterNetEvent('dealership:withdraw', function(amount)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    GetAccountBalance(dealership.id, function(balance)
        if balance < amount then
            Framework.Notify(source, '余额不足', 'error')
            return
        end

        AddTransaction(dealership.id, 'withdrawal', -amount, '提现', nil, nil, function(txId, newBalance)
            if txId then
                Framework.AddMoney(source, amount, 'cash')
                Framework.Notify(source, '提现成功', 'success')
                TriggerEvent('dealership:getAccount', source)
                TriggerEvent('dealership:getTransactions', source)
            else
                Framework.Notify(source, '提现失败', 'error')
            end
        end)
    end)
end)

RegisterNetEvent('dealership:sellVehicle', function(inventoryId, buyerIdentifier)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    MySQL.query('SELECT * FROM dealer_inventory WHERE id = ? AND dealership_id = ?', {inventoryId, dealership.id}, function(results)
        if not results or #results == 0 then
            Framework.Notify(source, '车辆不存在', 'error')
            return
        end

        local vehicle = results[1]
        local price = vehicle.price

        GetAccountBalance(dealership.id, function(balance)
            if balance < price then
                Framework.Notify(source, '余额不足', 'error')
                return
            end

            AddTransaction(dealership.id, 'sale', price, '车辆出售: ' .. vehicle.label, buyerIdentifier, nil, function(txId, newBalance)
                if txId then
                    UpdateVehicleStatus(inventoryId, 'sold', function()
                        local vehicleProps = json.decode(vehicle.props)
                        Framework.GiveVehicleByIdentifier(buyerIdentifier, vehicle.plate, vehicleProps)
                        Framework.Notify(source, '交易成功', 'success')
                        TriggerEvent('dealership:getAccount', source)
                        TriggerEvent('dealership:getInventory', source)
                    end)
                else
                    Framework.Notify(source, '交易失败', 'error')
                end
            end)
        end)
    end)
end)

RegisterNetEvent('dealership:uploadVehicle', function(plate)
    local source = source
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    if not Framework.IsVehicleOwnedBy(source, plate) then
        Framework.Notify(source, '这不是你的车', 'error')
        return
    end

    local identifier = Framework.GetPlayerIdentifier(source)
    local vehicles = Framework.GetPlayerVehicles(source)
    local vehicleData = nil

    for _, v in ipairs(vehicles) do
        if v.plate == plate then
            vehicleData = v
            break
        end
    end

    if not vehicleData then
        Framework.Notify(source, '车辆未找到', 'error')
        return
    end

    GetVehicleByPlate(dealership.id, plate, function(existing)
        if existing then
            Framework.Notify(source, '车辆已在库存中', 'error')
            return
        end

        local inspection = GenerateInspection(vehicleData)
        local model = vehicleData.model
        local label = Framework.GetVehicleLabel(model)

        AddToInventory(dealership.id, identifier, plate, model, label, json.encode(vehicleData.props or vehicleData.mods), 0, json.encode(inspection), function(id)
            if id then
                Framework.RemoveVehicle(plate)
                Framework.Notify(source, '车辆已上传到库存', 'success')
                TriggerEvent('dealership:getInventory', source)
            else
                Framework.Notify(source, '上传失败', 'error')
            end
        end)
    end)
end)

RegisterNetEvent('dealership:purchaseVehicle', function(targetSource, plate, price)
    local source = source
    local identifier = Framework.GetPlayerIdentifier(source)
    local dealership = Dealerships.GetPlayerDealership(source)

    if not dealership then
        Framework.Notify(source, '车行未初始化', 'error')
        return
    end

    if not Framework.IsVehicleOwnedBy(targetSource, plate) then
        Framework.Notify(source, '目标玩家不拥有此车辆', 'error')
        return
    end

    GetAccountBalance(dealership.id, function(balance)
        if balance < price then
            Framework.Notify(source, '车行余额不足', 'error')
            return
        end

        local targetIdentifier = Framework.GetPlayerIdentifier(targetSource)
        local vehicles = Framework.GetPlayerVehicles(targetSource)
        local vehicleData = nil

        for _, v in ipairs(vehicles) do
            if v.plate == plate then
                vehicleData = v
                break
            end
        end

        if not vehicleData then
            Framework.Notify(source, '车辆未找到', 'error')
            return
        end

        AddTransaction(dealership.id, 'purchase', -price, '收购车辆: ' .. plate, nil, targetIdentifier, function(txId, newBalance)
            if txId then
                Framework.RemoveVehicle(plate)
                Framework.GiveVehicle(identifier, plate, vehicleData.props or vehicleData.mods)

                Framework.Notify(targetSource, '车辆已出售，获得 $' .. price, 'success')
                Framework.Notify(source, '收购成功', 'success')

                TriggerEvent('dealership:getAccount', source)
                TriggerEvent('dealership:getTransactions', source)
            else
                Framework.Notify(source, '收购失败', 'error')
            end
        end)
    end)
end)

RegisterNetEvent('dealership:getPlayerVehicles', function()
    local source = source
    local vehicles = Framework.GetPlayerVehicles(source)
    TriggerClientEvent('dealership:playerVehicles', source, vehicles)
end)

function GenerateInspection(vehicleData)
    local engine = math.random(Config.VehicleInspection.Poor, Config.VehicleInspection.Excellent)
    local body = math.random(Config.VehicleInspection.Poor, Config.VehicleInspection.Excellent)
    local interior = math.random(Config.VehicleInspection.Poor, Config.VehicleInspection.Excellent)

    local function getCondition(value)
        if value >= 80 then return 'excellent'
        elseif value >= 60 then return 'good'
        elseif value >= 40 then return 'fair'
        else return 'poor' end
    end

    return {
        engine = engine,
        engineCondition = getCondition(engine),
        body = body,
        bodyCondition = getCondition(body),
        interior = interior,
        interiorCondition = getCondition(interior),
        mileage = math.random(1000, 200000),
        modifications = {},
        repairs = {},
        accidentHistory = {},
        inspectionDate = os.date('%Y-%m-%d %H:%M:%S')
    }
end

function Framework.GiveVehicleByIdentifier(identifier, plate, vehicleProps)
    if Config.Framework == 'ESX' then
        MySQL.insert('INSERT INTO owned_vehicles (owner, plate, vehicle, props) VALUES (?, ?, ?, ?)',
            {identifier, plate, vehicleData.model or vehicleData.hash or GetDisplayNameFromVehicleModel(vehicleData.model or vehicleData.hash), json.encode(vehicleProps)})
    elseif Config.Framework == 'QBCore' then
        MySQL.insert('INSERT INTO player_vehicles (citizenid, plate, vehicle, mods) VALUES (?, ?, ?, ?)',
            {identifier, plate, vehicleProps.model or vehicleProps.hash, json.encode(vehicleProps)})
    end
end

CreateThread(function()
    Wait(1000)
    InitializeDatabase()
    print('[二手车行] 服务端初始化完成')
end)

exports('GetPlayerDealership', Dealerships.GetPlayerDealership)
exports('GetDealershipByOwner', GetDealershipByOwner)
