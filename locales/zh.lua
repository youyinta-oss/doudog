Locales = {
    ['zh'] = {
        ['dealer'] = '二手车行',
        ['owner'] = '老板',
        ['inventory'] = '库存管理',
        ['showroom'] = '展厅配置',
        ['account'] = '车行账户',
        ['billing'] = '账单流水',
        ['purchase'] = '收购车辆',
        ['inspection'] = '检测报告',
        ['upload'] = '上传车辆',
        ['price'] = '价格',
        ['confirm'] = '确认',
        ['cancel'] = '取消',
        ['bank'] = '银行',
        ['cash'] = '现金',
        ['deposit'] = '充值',
        ['withdraw'] = '提现',
        ['balance'] = '余额',
        ['sold'] = '已售出',
        ['purchased'] = '已收购',
        ['deposited'] = '已充值',
        ['withdrawn'] = '已提现',
        ['no_vehicles'] = '没有车辆',
        ['not_owner'] = '你不是车行老板',
        ['insufficient_funds'] = '余额不足',
        ['transaction_success'] = '交易成功',
        ['transaction_failed'] = '交易失败',
        ['vehicle_not_nearby'] = '车辆不在附近',
        ['engine'] = '发动机状态',
        ['body'] = '车身状态',
        ['interior'] = '内饰状态',
        ['mileage'] = '里程数',
        ['modifications'] = '改装记录',
        ['repairs'] = '维修记录',
        ['accident_history'] = '事故记录',
        ['excellent'] = '优秀',
        ['good'] = '良好',
        ['fair'] = '一般',
        ['poor'] = '较差'
    }
}

function _(key)
    local locale = Locales[Config.Locale] or Locales['en']
    return locale[key] or key
end
