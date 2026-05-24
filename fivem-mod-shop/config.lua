Config = {}

Config.Currency = '$'
Config.CurrencyName = '金币'

Config.OpenCommand = 'modshop'
Config.OpenKey = 'F5'

Config.DefaultCoins = 1000

Config.Mods = {
    {
        id = 1,
        name = '赛博朋克战士',
        description = '未来科技风格的赛博朋克战士模型',
        price = 500,
        model = 'mp_m_freemode_01',
        category = 'cyberpunk',
        enabled = true
    },
    {
        id = 2,
        name = '中世纪骑士',
        description = '经典中世纪骑士盔甲模型',
        price = 300,
        model = 'mp_m_freemode_01',
        category = 'medieval',
        enabled = true
    },
    {
        id = 3,
        name = '现代特种兵',
        description = '现代军事风格的特种兵模型',
        price = 400,
        model = 'mp_m_freemode_01',
        category = 'military',
        enabled = true
    },
    {
        id = 4,
        name = '街头混混',
        description = '街头风格的休闲角色模型',
        price = 200,
        model = 'mp_m_freemode_01',
        category = 'casual',
        enabled = true
    },
    {
        id = 5,
        name = '超级英雄',
        description = '经典超级英雄风格的角色模型',
        price = 600,
        model = 'mp_m_freemode_01',
        category = 'hero',
        enabled = true
    }
}

Config.AdminIdentifiers = {
    'license:abc123def456'
}

Config.Categories = {
    ['cyberpunk'] = '赛博朋克',
    ['medieval'] = '中世纪',
    ['military'] = '军事',
    ['casual'] = '休闲',
    ['hero'] = '英雄'
}
