Config = {}

Config.Framework = 'ESX' -- 'ESX' or 'QBCore'

Config.Owners = {
    'steam:110000112345678', -- Add owner identifiers here
    'license:xxxxxxxxxxxxx',
}

Config.Locale = 'zh'

Config.VehicleInspection = {
    EngineCondition = {
        Excellent = 90,
        Good = 70,
        Fair = 50,
        Poor = 30
    },
    BodyCondition = {
        Excellent = 95,
        Good = 80,
        Fair = 60,
        Poor = 40
    },
    InteriorCondition = {
        Excellent = 90,
        Good = 70,
        Fair = 50,
        Poor = 30
    }
}

Config.ShowroomSlots = 8

Config.DefaultPrices = {
    InspectionFee = 500,
    StorageFee = 100
}

Config.NUI = {
    Debug = false,
    Theme = 'dark'
}
