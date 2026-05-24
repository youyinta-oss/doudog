local apiUrl = 'http://localhost:3001/api'

AddEventHandler('playerConnecting', function(playerName, setKickReason, deferrals)
    local source = source
    local identifier = GetPlayerIdentifierByType(source, 'license')
    
    if identifier then
        local response = AwaitRequest(apiUrl .. '/user/' .. identifier .. '/coins')
        
        if not response or not response.success then
            CreatePlayerInDatabase(identifier, playerName)
        end
    end
end)

AddEventHandler('modshop:modelApplied', function(modelPath)
    local source = source
    local identifier = GetPlayerIdentifierByType(source, 'license')
    
    print('Player ' .. GetPlayerName(source) .. ' applied model: ' .. modelPath)
end)

function CreatePlayerInDatabase(identifier, name)
    local response = AwaitRequest(apiUrl .. '/admin/users', {
        method = 'POST',
        headers = {
            ['Content-Type'] = 'application/json'
        },
        body = json.encode({
            identifier = identifier,
            name = name
        })
    })
    
    if response and response.success then
        print('Created new player in database: ' .. name)
    end
end

function AwaitRequest(url, options)
    local promise = promise.new()
    
    PerformHttpRequest(url, function(statusCode, response, headers)
        if statusCode == 200 or statusCode == 201 then
            local data = json.decode(response)
            promise:resolve(data)
        else
            promise:resolve(nil)
        end
    end, options.method or 'GET', options.body or '', options.headers or {})
    
    return Citizen.Await(promise)
end

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        print('FiveM Character Mod System started successfully')
    end
end)
