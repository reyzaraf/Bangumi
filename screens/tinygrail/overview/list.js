/*
 * @Author: czy0729
 * @Date: 2019-08-25 19:50:36
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-22 16:57:00
 */
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Loading, ListView } from '@components'
import { _ } from '@stores'
import Item from '../_/item'
import { sortList } from '../_/utils'
import { tabs } from './store'

function List({ index }, { $ }) {
  const { key } = tabs[index]
  const list = $.list(key)
  if (!list._loaded) {
    return <Loading style={_.container.flex} />
  }

  const { sort, direction } = $.state
  let _list = list
  if (sort) {
    _list = {
      ..._list,
      list: sortList(sort, direction, list.list)
    }
  }

  const event = {
    id: '热门榜单.跳转'
  }
  return (
    <ListView
      style={_.container.flex}
      keyExtractor={item => String(item.id)}
      data={_list}
      renderItem={({ item, index }) => (
        <Item index={index} event={event} {...item} />
      )}
      onHeaderRefresh={() => $.fetchList(key)}
    />
  )
}

List.defaultProps = {
  title: '全部'
}

List.contextTypes = {
  $: PropTypes.object
}

export default observer(List)
