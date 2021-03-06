/*
 * @Author: czy0729
 * @Date: 2019-07-13 18:46:55
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-20 22:36:40
 */
import React from 'react'
import { ScrollView, View } from 'react-native'
import PropTypes from 'prop-types'
import { Pagination, NavigationBarEvents } from '@screens/_'
import { _ } from '@stores'
import { open } from '@utils'
import { inject, withTransitionHeader, observer } from '@utils/decorators'
import { hm, t } from '@utils/fetch'
import { HOST } from '@constants'
import Info from './info'
import List from './list'
import Store from './store'

const title = '小组'

export default
@inject(Store)
@withTransitionHeader({
  screen: title,
  barStyle: 'dark-content'
})
@observer
class RakuenGroup extends React.Component {
  static contextTypes = {
    $: PropTypes.object,
    navigation: PropTypes.object
  }

  async componentDidMount() {
    const { $, navigation } = this.context
    await $.init()

    const { title: _title } = $.groupInfo
    withTransitionHeader.setTitle(navigation, _title)
    this.updatePopover()

    hm(`group/${$.groupId}`, 'Group')
  }

  updatePopover = () => {
    const { $, navigation } = this.context
    const { joinUrl, byeUrl } = $.groupInfo
    const data = ['浏览器查看', '小组成员']
    if (joinUrl) {
      data.push('加入小组')
    }
    if (byeUrl) {
      data.push('退出小组')
    }
    navigation.setParams({
      popover: {
        data,
        onSelect: async key => {
          t('小组.右上角菜单', {
            key,
            groupId: $.groupId
          })

          switch (key) {
            case '浏览器查看':
              open(`${HOST}/group/${$.groupId}`)
              break
            case '小组成员':
              open(`${HOST}/group/${$.groupId}/members`)
              break
            case '加入小组':
              await $.doJoin()
              this.updatePopover()
              break
            case '退出小组':
              await $.doBye()
              this.updatePopover()
              break
            default:
              break
          }
        }
      }
    })
  }

  renderPagination() {
    const { $ } = this.context
    const { ipt } = $.state
    return (
      <Pagination
        input={ipt}
        onPrev={$.prev}
        onNext={$.next}
        onChange={$.onChange}
        onSearch={$.doSearch}
      />
    )
  }

  render() {
    const { $ } = this.context
    const { show, _loaded } = $.state
    if (!_loaded) {
      return (
        <>
          <NavigationBarEvents />
          <View style={_.container.flex} />
        </>
      )
    }

    const { onScroll } = this.props
    return (
      <>
        <NavigationBarEvents />
        <ScrollView
          style={_.container.content}
          contentContainerStyle={_.container.bottom}
          scrollEventThrottle={16}
          onScroll={onScroll}
          {...withTransitionHeader.listViewProps}
        >
          <Info />
          {this.renderPagination()}
          {show && (
            <>
              <View
                style={[
                  {
                    minHeight: _.window.height
                  },
                  _.mt.md
                ]}
              >
                <List />
              </View>
              <View style={_.mt.md}>{this.renderPagination()}</View>
            </>
          )}
        </ScrollView>
      </>
    )
  }
}
