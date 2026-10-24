# 地理数据来源与覆盖范围

- 浙江省市区县乡镇目录：modood/Administrative-divisions-of-China，dist/pcas-code.json，https://github.com/modood/Administrative-divisions-of-China 。获取日期：2026-10-24。此为开源目录快照，并非实时行政区划核验，可能包含历史名称及开发区等特殊单元。
- 浙江省、地级市、宁波10个区县边界：阿里云 DataV 行政区划数据 https://geo.datav.aliyun.com/areas_v3/bound/ 。获取日期：2026-10-24。
- 宁波乡镇街道支持按目录选择、客户地址录入与筛选。未提供乡镇、村级边界，不应将区县边界误称为乡镇边界。
- 只有手工录入的WGS84经纬度才生成客户地图点位，未进行地址自动地理编码。客户原始演示数据缺少区县与乡镇信息，不推测精确位置。
- 使用村/社区/门牌字段保存文本地址，不提供村级行政区划查询。
