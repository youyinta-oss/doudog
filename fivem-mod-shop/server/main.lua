local QBCore = exports['qb-core']:GetCoreObject()
local ESX = nil
if GetResourceState('es_extended') == 'started' then
    ESX = exports['es_extended']:getSharedObject()
end

local playerData = {}

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        print('[FiveM-ModShop] 插件已启动')
        InitializeDatabase()
    end
end)

function InitializeDatabase()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS modshop_players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(100) NOT NULL UNIQUE,
            name VARCHAR(100),
            coins INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]])
    
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS modshop_owned (
            id INT AUTO_INCREMENT PRIMARY KEY,
            player_id INT,
            mod_id INT,
            equipped BOOLEAN DEFAULT FALSE,
            purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES modshop_players(id)
        )
    ]])
    
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS modshop_mods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            description TEXT,
            price INT,
            model VARCHAR(100),
            category VARCHAR(50),
            enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]])
    
    -- 插入默认Mod
    MySQL.query('SELECT COUNT(*) as count FROM modshop_mods', {}, function(result)
        if result[1].count == 0 then
            for _, mod in ipairs(Config.Mods) do
                MySQL.insert('INSERT INTO modshop_mods (name, description, price, model, category, enabled) VALUES (?, ?, ?, ?, ?, ?)', {
                    mod.name,
                    mod.description,
                    mod.price,
                    mod.model,
                    mod.category,
                    true
                })
            end
            print('[FiveM-ModShop] 已初始化默认Mod数据')
        end
    end)
end

RegisterNetEvent('modshop:server:LoadPlayer')
AddEventHandler('modshop:server:LoadPlayer', function()
    local src = source
    local identifier = GetPlayerIdentifier(src, 0)
    local name = GetPlayerName(src)
    
    MySQL.query('SELECT * FROM modshop_players WHERE identifier = ?', {identifier}, function(result)
        if result and #result > 0 then
            playerData[src] = result[1]
            LoadPlayerMods(src)
        else
            MySQL.insert('INSERT INTO modshop_players (identifier, name, coins) VALUES (?, ?, ?)', {
                identifier,
                name,
                Config.DefaultCoins
            }, function(id)
                MySQL.query('SELECT * FROM modshop_players WHERE id = ?', {id}, function(playerResult)
                    if playerResult and #playerResult > 0 then
                        playerData[src] = playerResult[1]
                        playerData[src].mods = {}
                        playerData[src].equippedMod = nil
                        SendPlayerData(src)
                    end
                end)
            end)
        end
    end)
end)

function LoadPlayerMods(src)
    if not playerData[src] then return end
    
    MySQL.query([[
        SELECT mo.*, m.name, m.description, m.price, m.model, m.category 
        FROM modshop_owned mo 
        LEFT JOIN modshop_mods m ON mo.mod_id = m.id 
        WHERE mo.player_id = ?
    ]], {playerData[src].id}, function(result)
        playerData[src].mods = result or {}
        playerData[src].equippedMod = nil
        
        for _, mod in ipairs(playerData[src].mods) do
            if mod.equipped then
                playerData[src].equippedMod = mod
                break
            end
        end
        
        SendPlayerData(src)
    end)
end

function SendPlayerData(src)
    if not playerData[src] then return end
    
    TriggerClientEvent('modshop:client:PlayerData', src, {
        coins = playerData[src].coins,
        ownedMods = playerData[src].mods or {},
        equippedMod = playerData[src].equippedMod
    })
end

RegisterNetEvent('modshop:server:GetMods')
AddEventHandler('modshop:server:GetMods', function()
    local src = source
    MySQL.query('SELECT * FROM modshop_mods WHERE enabled = TRUE', {}, function(result)
        TriggerClientEvent('modshop:client:ModsList', src, result or {})
    end)
end)

RegisterNetEvent('modshop:server:BuyMod')
AddEventHandler('modshop:server:BuyMod', function(modId)
    local src = source
    if not playerData[src] then return end
    
    MySQL.query('SELECT * FROM modshop_mods WHERE id = ?', {modId}, function(result)
        if not result or #result == 0 then
            TriggerClientEvent('modshop:client:Notification', src, 'Mod不存在', 'error')
            return
        end
        
        local mod = result[1]
        
        if playerData[src].coins < mod.price then
            TriggerClientEvent('modshop:client:Notification', src, '金币不足', 'error')
            return
        end
        
        MySQL.query('SELECT * FROM modshop_owned WHERE player_id = ? AND mod_id = ?', {playerData[src].id, modId}, function(ownedResult)
            if ownedResult and #ownedResult > 0 then
                TriggerClientEvent('modshop:client:Notification', src, '您已拥有此Mod', 'error')
                return
            end
            
            playerData[src].coins = playerData[src].coins - mod.price
            
            MySQL.update('UPDATE modshop_players SET coins = ? WHERE id = ?', {
                playerData[src].coins,
                playerData[src].id
            })
            
            MySQL.insert('INSERT INTO modshop_owned (player_id, mod_id) VALUES (?, ?)', {
                playerData[src].id,
                modId
            })
            
            LoadPlayerMods(src)
            TriggerClientEvent('modshop:client:Notification', src, '成功购买: ' .. mod.name, 'success')
        end)
    end)
end)

RegisterNetEvent('modshop:server:EquipMod')
AddEventHandler('modshop:server:EquipMod', function(modId)
    local src = source
    if not playerData[src] then return end
    
    MySQL.update('UPDATE modshop_owned SET equipped = FALSE WHERE player_id = ?', {playerData[src].id})
    
    if modId then
        MySQL.update('UPDATE modshop_owned SET equipped = TRUE WHERE player_id = ? AND mod_id = ?', {
            playerData[src].id,
            modId
        })
    end
    
    LoadPlayerMods(src)
    TriggerClientEvent('modshop:client:Notification', src, '装备已更新', 'success')
end)

RegisterNetEvent('modshop:server:GiveCoins')
AddEventHandler('modshop:server:GiveCoins', function(targetId, amount)
    local src = source
    local adminIdentifier = GetPlayerIdentifier(src, 0)
    
    local isAdmin = false
    for _, id in ipairs(Config.AdminIdentifiers) do
        if adminIdentifier == id then
            isAdmin = true
            break
        end
    end
    
    if not isAdmin then
        TriggerClientEvent('modshop:client:Notification', src, '无权限', 'error')
        return
    end
    
    if not playerData[targetId] then
        TriggerClientEvent('modshop:client:Notification', src, '玩家未加载', 'error')
        return
    end
    
    playerData[targetId].coins = playerData[targetId].coins + amount
    
    MySQL.update('UPDATE modshop_players SET coins = ? WHERE id = ?', {
        playerData[targetId].coins,
        playerData[targetId].id
    })
    
    SendPlayerData(targetId)
    TriggerClientEvent('modshop:client:Notification', src, '已赠送 ' .. amount .. ' 金币', 'success')
    TriggerClientEvent('modshop:client:Notification', targetId, '获得 ' .. amount .. ' 金币', 'success')
end)

function GetPlayerIdentifier(src, index)
    local identifiers = GetPlayerIdentifiers(src)
    if identifiers and identifiers[index] then
        return identifiers[index]
    end
    return nil
end

AddEventHandler('playerDropped', function()
    local src = source
    playerData[src] = nil
end)
