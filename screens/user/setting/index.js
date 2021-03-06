/*
 * @Author: czy0729
 * @Date: 2019-05-24 01:34:26
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-21 20:00:24
 */
import React from 'react'
import { ScrollView, AsyncStorage } from 'react-native'
import { Text, Switch } from '@components'
import { Popover, ItemSetting } from '@screens/_'
import Stores, { _, userStore, systemStore } from '@stores'
import { toFixed } from '@utils'
import { withHeader, observer } from '@utils/decorators'
import { info } from '@utils/ui'
import { appNavigate } from '@utils/app'
import { t } from '@utils/fetch'
import {
  IOS,
  FEEDBACK_URL,
  GITHUB_URL,
  GITHUB_RELEASE_URL,
  VERSION_GITHUB_RELEASE,
  VERSION_CODE_PUSH,
  USERID_TOURIST,
  USERID_IOS_AUTH,
  SAY_DEVELOP_ID
} from '@constants'
import { MODEL_SETTING_QUALITY } from '@constants/model'

const title = '设置'

export default
@withHeader({
  screen: title,
  hm: ['settings', 'Setting']
})
@observer
class Setting extends React.Component {
  static navigationOptions = {
    title
  }

  state = {
    showDev: false,
    storageSize: ''
  }

  componentDidMount() {
    this.caculateStorageSize()
  }

  setParams = () => {
    const { navigation } = this.props
    navigation.setParams({})
  }

  caculateStorageSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const storages = await AsyncStorage.multiGet(keys)
      let storageSize = 0
      storages.forEach(item => {
        storageSize += item[0].length + item[1].length
      })
      this.setState({
        storageSize: `${toFixed(storageSize / 1000, 1)}KB`
      })
    } catch (error) {
      warn('Setting', 'caculateStorageSize', error)
    }
  }

  clearStorage = () => {
    t('设置.清除缓存')

    Stores.clearStorage()
    setTimeout(() => {
      this.caculateStorageSize()
    }, 2400)
  }

  setQuality = label => {
    if (label) {
      t('设置.切换', {
        title: '质量',
        label
      })

      systemStore.setQuality(label)
    }
  }

  toggleDev = () => {
    const { showDev } = this.state
    this.setState({
      showDev: !showDev
    })
    info(`调式模式 ${!showDev ? '开' : '关'}`)
    systemStore.toggleDev()
  }

  get userId() {
    return userStore.userInfo.id
  }

  get isLogin() {
    return userStore.isLogin
  }

  get showQiafan() {
    if (!IOS) {
      return true
    }

    if (!this.isLogin) {
      return false
    }

    if (
      !this.userId ||
      this.userId == USERID_TOURIST ||
      this.userId == USERID_IOS_AUTH
    ) {
      return false
    }

    return true
  }

  renderModule() {
    const { tinygrail } = systemStore.setting
    return (
      <>
        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          模块
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='黑暗模式'
          ft={
            <Switch
              checked={_.isDark}
              onChange={() => {
                t('设置.切换', {
                  title: '黑暗模式',
                  checked: !_.isDark
                })

                _.toggleMode()
                if (!IOS) {
                  setTimeout(() => {
                    // 安卓需要刷新头
                    this.setParams()
                  }, 0)
                }
              }}
            />
          }
          withoutFeedback
          information='首页点击头部Bangumi的Logo也可以快速切换主题'
        />
        <ItemSetting
          border
          hd='小圣杯'
          ft={
            <Switch
              checked={tinygrail}
              onChange={() => {
                t('设置.切换', {
                  title: '小圣杯',
                  checked: !tinygrail
                })

                systemStore.switchTinygrail()
              }}
            />
          }
          withoutFeedback
        />
        {tinygrail && (
          <ItemSetting
            border
            hd='小圣杯主题色'
            ft={
              <Popover
                data={['绿涨红跌', '红涨绿跌']}
                onSelect={() => {
                  t('设置.切换', {
                    title: '小圣杯主题色',
                    label: !_.isGreen ? '绿涨红跌' : '红涨绿跌'
                  })

                  _.toggleTinygrailMode()
                }}
              >
                <Text size={16} type='sub'>
                  {_.isGreen ? '绿涨红跌' : '红涨绿跌'}
                </Text>
              </Popover>
            }
            arrow
            highlight
          />
        )}
      </>
    )
  }

  renderBasic() {
    const { quality, cnFirst, autoFetch } = systemStore.setting
    return (
      <>
        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          基本
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='图片质量'
          ft={
            <Popover
              data={MODEL_SETTING_QUALITY.data.map(({ label }) => label)}
              onSelect={this.setQuality}
            >
              <Text size={16} type='sub'>
                {MODEL_SETTING_QUALITY.getLabel(quality)}
              </Text>
            </Popover>
          }
          arrow
          highlight
        />
        <ItemSetting
          border
          hd='优先中文'
          ft={
            <Switch
              checked={cnFirst}
              onChange={() => {
                t('设置.切换', {
                  title: '优先中文',
                  checked: !cnFirst
                })

                systemStore.switchCnFirst()
              }}
            />
          }
          withoutFeedback
        />
        <ItemSetting
          border
          hd='优化请求量'
          ft={
            <Switch
              checked={!autoFetch}
              onChange={() => {
                t('设置.切换', {
                  title: '优化请求量',
                  checked: !autoFetch
                })

                systemStore.switchAutoFetch()
              }}
            />
          }
          withoutFeedback
          information='因维护成本大且效果不好, 即将废弃, 请勿开启'
        />
      </>
    )
  }

  renderUI() {
    const {
      // iosMenu,
      avatarRound,
      heatMap,
      speech
    } = systemStore.setting
    return (
      <>
        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          UI
        </Text>
        {/* {!IOS && (
          <ItemSetting
            style={_.mt.sm}
            hd='iOS风格菜单'
            ft={
              <Switch checked={iosMenu} onChange={systemStore.switchIOSMenu} />
            }
            withoutFeedback
            information='模拟菜单, 非原生性能略弱, 但显示信息更多并且支持黑暗模式'
          />
        )} */}
        <ItemSetting
          // style={IOS ? _.mt.sm : undefined}
          // border={!IOS}
          style={_.mt.sm}
          border
          hd='圆形头像'
          ft={
            <Switch
              checked={avatarRound}
              onChange={() => {
                t('设置.切换', {
                  title: '圆形头像',
                  checked: !avatarRound
                })

                systemStore.switchAvatarRound()
              }}
            />
          }
          withoutFeedback
        />
        <ItemSetting
          border
          hd='章节讨论热力图'
          ft={
            <Switch
              checked={heatMap}
              onChange={() => {
                t('设置.切换', {
                  title: '章节讨论热力图',
                  checked: !heatMap
                })

                systemStore.switchHeatMap()
              }}
            />
          }
          withoutFeedback
          information='章节按钮下方不同透明度的橙色条块, 可以快速了解到哪些章节讨论比较激烈'
        />
        <ItemSetting
          border
          hd='Bangumi娘话语'
          ft={
            <Switch
              checked={speech}
              onChange={() => {
                t('设置.切换', {
                  title: 'Bangumi娘话语',
                  checked: !speech
                })

                systemStore.switchSpeech()
              }}
            />
          }
          withoutFeedback
        />
      </>
    )
  }

  renderContact() {
    const { navigation } = this.props
    const { name } = systemStore.release
    const hasNewVersion = name !== VERSION_GITHUB_RELEASE
    let version = VERSION_GITHUB_RELEASE
    if (VERSION_CODE_PUSH) {
      version += ` (${VERSION_CODE_PUSH})`
    }
    return (
      <>
        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          联系
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='版本'
          ft={
            hasNewVersion && !IOS ? (
              <Text type='success' size={16}>
                有新版本{name}
                <Text type='sub' size={16}>
                  {' '}
                  / 当前{version}
                </Text>
              </Text>
            ) : (
              `当前版本${version}`
            )
          }
          arrow={!IOS}
          onPress={
            IOS
              ? undefined
              : () =>
                  appNavigate(GITHUB_RELEASE_URL, undefined, undefined, {
                    id: '设置.跳转'
                  })
          }
        />
        <ItemSetting
          border
          hd='功能需求反馈'
          arrow
          highlight
          onPress={() => {
            t('设置.跳转', {
              to: 'Say'
            })

            navigation.push('Say', {
              id: SAY_DEVELOP_ID
            })
          }}
        />
        <ItemSetting
          border
          hd='项目帖子'
          arrow
          highlight
          onPress={() =>
            appNavigate(FEEDBACK_URL, navigation, undefined, {
              id: '设置.跳转'
            })
          }
        />
        <ItemSetting
          border
          hd='项目地址'
          ft='求个星星'
          arrow
          highlight
          onPress={() =>
            appNavigate(GITHUB_URL, undefined, undefined, {
              id: '设置.跳转'
            })
          }
        />
        <ItemSetting
          border
          hd='🍚'
          arrow
          highlight
          onPress={() => {
            t('设置.跳转', {
              to: 'Qiafan'
            })

            navigation.push('Qiafan')
          }}
        />
      </>
    )
  }

  renderSystem() {
    const { navigation } = this.props
    const { storageSize } = this.state
    return (
      <>
        <Text style={[_.container.wind, _.mt.md]} type='sub'>
          系统
        </Text>
        <ItemSetting
          style={_.mt.sm}
          hd='清除数据缓存'
          ft={
            <Text size={16} type='sub'>
              {storageSize}
            </Text>
          }
          arrow
          highlight
          onPress={this.clearStorage}
        />
        <ItemSetting
          border
          hd={
            <Text size={16} type='danger'>
              退出登陆
            </Text>
          }
          arrow
          highlight
          onPress={() => {
            t('设置.退出登陆')

            Stores.logout(navigation)
          }}
        />
      </>
    )
  }

  render() {
    return (
      <ScrollView
        style={_.container.screen}
        contentContainerStyle={_.container.bottom}
      >
        {this.renderModule()}
        {this.renderBasic()}
        {this.renderUI()}
        {this.renderContact()}
        {this.renderSystem()}
      </ScrollView>
    )
  }
}
