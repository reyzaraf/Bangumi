/*
 * @Author: czy0729
 * @Date: 2019-08-25 19:50:36
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-22 02:55:43
 */
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Loading, ListView } from '@components'
import { _ } from '@stores'
import Item from '../_/item'
import { tabs } from './store'

function List({ index }, { $ }) {
  const { key } = tabs[index]
  const list = $.list(key)
  if (!list._loaded) {
    return <Loading style={_.container.flex} />
  }

  const event = {
    id: 'ICO.跳转'
  }
  return (
    <ListView
      style={_.container.flex}
      keyExtractor={item => String(item.id)}
      data={list}
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
