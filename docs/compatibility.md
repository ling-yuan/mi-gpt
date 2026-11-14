# 🔊 支持的小爱音箱型号

## ✅ 完美运行

已知可以完美运行 `MiGPT` 的小爱音箱型号有：

> 注意：这里的连续对话是一种实验性功能，并非小爱音箱自带的连续对话。在没有刷机的情况下，使用效果并不理想（仅供尝鲜），建议日常使用时关闭 `streamResponse` 选项。

| 名称                     | 型号                                                                                                | ttsCommand | wakeUpCommand | playingCommand | streamResponse | 反馈来源                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ---------- | ------------- | -------------- | -------------- | --------------------------------------------------------------------------------- |
| Xiaomi 智能音箱 Pro      | [OH2P](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-oh2p:1) | `[7, 3]`   | `[7, 1]`      | -              | true           | [@idootop](https://github.com/idootop)                                            |
| Xiaomi 智能音箱          | [OH2](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-oh2:1)   | `[5, 3]`   | `[5, 1]`      | `[3, 1, 1]`    | true           | [@fuchao](https://github.com/fuchao2pku)                                          |
| 小爱音箱 Pro             | [LX06](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-lx06:2) | `[5, 1]`   | `[5, 3]`      | -              | true           | [@idootop](https://github.com/idootop)                                            |
| 小米 AI 音箱             | [S12](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-s12:2)   | `[5, 1]`   | `[5, 3]`      | -              | true           | 微信: CMSJ                                                                        |
| 小米 AI 音箱（第二代）   | [L15A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-l15a:2) | `[7, 3]`   | `[7, 1]`      | `[3, 1, 1]`    | true           | 微信: 龙之广                                                                      |
| 小爱音箱 万能遥控版      | [LX5A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-lx5a:2) | `[5, 1]`   | `[5, 3]`      | -              | true           | [@imhsz](https://github.com/idootop/mi-gpt/issues/62)                             |
| 小爱音箱 Play（2019 款） | [LX05](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-lx05:1) | `[5, 1]`   | `[5, 3]`      | `[3, 1, 1]`    | true           | [@wt666666](https://github.com/idootop/mi-gpt/issues/92#issuecomment-2168424538)  |
| 小爱智能家庭屏 10        | [X10A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-x10a:1) | `[7, 3]`   | `[7, 1]`      | -              | true           | [@IDarkBoss](https://github.com/idootop/mi-gpt/issues/92#issuecomment-2190928452) |
| Xiaomi Sound Pro         | [L17A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-l17a:1) | `[7, 3]`   | `[7, 1]`      | -              | true           | 微信: eof                                                                         |

## 🚗 正常运行

可以正常运行 `MiGPT`，但不支持连续对话的小爱音箱型号有：

> 部分机型的 MIoT 接口不支持查询设备播放状态或查询状态异常，比如小米音箱 Play 增强版（L05C），将会导致 `MiGPT` 部分功能异常，无法使用连续对话等，此时需要关闭 `streamResponse`。相关 [issue](https://github.com/idootop/mi-gpt/issues/14)

L05C 的 MiNA 媒体播放状态也不能可靠反映原生 TTS 是否播完。本项目会对该型号的原生 TTS 自动合并完整回答后一次播报，避免后一段截断前一段；即使开启 `streamResponse`，也不会分段播报原生 TTS。第三方 TTS 不受此处理影响。

| 名称                          | 型号                                                                                                | ttsCommand | wakeUpCommand | playingCommand | streamResponse | 反馈来源                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ---------- | ------------- | -------------- | -------------- | -------------------------------------------------------------------------------------- |
| 小爱音箱                      | [L06A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-l06a:2) | `[5, 1]`   | `[5, 2]`      | -              | false          | [@zhanglc](https://github.com/idootop/mi-gpt/issues/42)                                |
| 小爱音箱 mini                 | [LX01](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-lx01:1) | `[5, 1]`   | `[5, 2]`      | -              | false          | [@gsscsd](https://github.com/idootop/mi-gpt/issues/92#issuecomment-2168013500)         |
| 小爱音箱 Play                 | [L05B](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-l05b:1) | `[5, 3]`   | `[5, 1]`      | -              | false          | [@BiuBiu2323](https://github.com/idootop/mi-gpt/issues/48)                             |
| 小米小爱音箱 Play 增强版      | [L05C](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-l05c:1) | `[5, 3]`   | `[5, 1]`      | -              | false          | [@lyddias](https://github.com/idootop/mi-gpt/issues/14)                                |
| 小爱音箱 Art                  | [L09A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-l09a:1) | `[3, 1]`   | `[3, 2]`      | -              | false          | [@zwsn](https://github.com/idootop/mi-gpt/issues/92#issuecomment-2181944065)           |
| 小爱触屏音箱                  | [LX04](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-lx04:2) | `[5, 1]`   | `[5, 2]`      | -              | false          | [@ilovesouthpark](https://github.com/idootop/mi-gpt/issues/92#issuecomment-2184678990) |
| Xiaomi 智能家庭屏 Mini        | [ASX4B](https://home.miot-spec.com/spec/xiaomi.wifispeaker.x4b)                                     | `[5, 3]`   | `[5, 1]`      | -              | false          | [@VincentGresham](https://github.com/idootop/mi-gpt/issues/92#issuecomment-2645762809) |
| Xiaomi 智能家庭屏 6           | [X6A](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-x6a:1)   | `[7, 3]`   | `[7, 1]`      | -              | false          | [@Hongwing](https://github.com/idootop/mi-gpt/issues/80)                               |
| Redmi 小爱触屏音箱 Pro 8 英寸 | [X08E](https://home.miot-spec.com/spec?type=urn:miot-spec-v2:device:speaker:0000A015:xiaomi-x08e:1) | `[7, 3]`   | `[7, 1]`      | -              | false          | [@shangjiyu](https://github.com/idootop/mi-gpt/issues/20)                              |
| Xiaomi 智能家庭屏 Pro 8       | [X8F](https://home.miot-spec.com/spec/xiaomi.wifispeaker.x8f)                                       | `[7, 3]`   | `[7, 1]`      | -              | false          | [@xiaodou](https://github.com/idootop/mi-gpt/pull/301)                                 |

## ❌ 不支持

完全不支持 `MiGPT` 的小爱音箱型号有：

| 名称                   | 型号                                                           | 反馈来源                                                  |
| ---------------------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| 小米小爱音箱 HD        | [SM4](https://home.miot-spec.com/spec/onemore.wifispeaker.sm4) | [@romantech](https://github.com/idootop/mi-gpt/issues/91) |
| 小米小爱蓝牙音箱随身版 | -                                                              | 微信: 明天                                                |

## 🔥 型号分享

如果你是其他型号的小爱音箱，欢迎把你的型号和配置参数分享给大家，分享格式如下：

- 名称：小爱音箱 Pro
- 型号：LX06
- ttsCommand：[5, 1]
- wakeUpCommand：[5, 3]
- playingCommand：未设置
- streamResponse：true（支持连续对话）
