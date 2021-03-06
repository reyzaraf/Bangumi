/*
 * @Author: czy0729
 * @Date: 2019-08-25 19:40:56
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-21 21:01:47
 */
import { observable, computed } from 'mobx'
import { tinygrailStore } from '@stores'
import store from '@utils/store'
import { t } from '@utils/fetch'
import {
  SORT_HYD,
  SORT_GX,
  SORT_SCJ,
  SORT_FHL,
  SORT_DQJ,
  SORT_DQZD,
  SORT_XFJL
} from '../_/utils'

export const tabs = [
  {
    title: '我的买单',
    key: 'bid'
  },
  {
    title: '我的卖单',
    key: 'asks'
  },
  {
    title: '我的拍卖',
    key: 'auction'
  }
]
export const sortDS = [
  SORT_HYD,
  SORT_GX,
  SORT_SCJ,
  SORT_FHL,
  SORT_DQJ,
  SORT_DQZD,
  SORT_XFJL
]

export default class ScreenTinygrailBid extends store {
  state = observable({
    page: 0,
    sort: '',
    direction: '',
    _loaded: false
  })

  init = async () => {
    const { type } = this.params
    const page = tabs.findIndex(item => item.key === type)
    this.setState({
      page,
      _loaded: true
    })
    this.fetchList(tabs[page].key)
  }

  // -------------------- fetch --------------------
  fetchList = key => {
    if (key === 'bid') {
      return tinygrailStore.fetchBid()
    }

    if (key === 'asks') {
      return tinygrailStore.fetchAsks()
    }

    return tinygrailStore.fetchAuction()
  }

  // -------------------- get --------------------
  list(key = 'bid') {
    return computed(() => tinygrailStore.list(key)).get()
  }

  // -------------------- page --------------------
  onChange = (item, page) => {
    if (page === this.state.page) {
      return
    }

    t('我的委托.标签页切换', {
      page
    })

    this.setState({
      page,
      sort: '',
      direction: ''
    })
    this.tabChangeCallback(page)
  }

  tabChangeCallback = page => {
    const { key } = tabs[page]
    const { _loaded } = this.list(key)
    if (!_loaded) {
      this.fetchList(key)
    }
  }

  onSortPress = item => {
    const { sort, direction } = this.state
    if (item === sort) {
      let nextSort = item
      let nextDirection = 'down'
      if (direction === 'down') {
        nextDirection = 'up'
      } else if (direction === 'up') {
        nextSort = ''
        nextDirection = ''
      }

      t('我的委托.排序', {
        sort: nextSort,
        direction: nextDirection
      })

      this.setState({
        sort: nextSort,
        direction: nextDirection
      })
    } else {
      t('我的委托.排序', {
        sort: item,
        direction: 'down'
      })

      this.setState({
        sort: item,
        direction: 'down'
      })
    }
  }
}
