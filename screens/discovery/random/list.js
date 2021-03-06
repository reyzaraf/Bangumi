/*
 * @Author: czy0729
 * @Date: 2019-06-23 02:20:58
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-05 00:54:44
 */
import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { ListView } from '@components'
import { StatusBarPlaceholder } from '@screens/_'
import { _ } from '@stores'
import Item from './item'

function List(props, { $ }) {
  return (
    <ListView
      style={_.container.screen}
      contentContainerStyle={_.container.bottom}
      keyExtractor={item => String(item.id)}
      data={$.random}
      ListHeaderComponent={
        <StatusBarPlaceholder style={{ backgroundColor: _.colorBg }} />
      }
      renderItem={({ item }) => <Item {...item} />}
      onHeaderRefresh={() => $.fetchRandom(true)}
      onFooterRefresh={$.fetchRandom}
    />
  )
}

List.contextTypes = {
  $: PropTypes.object
}

export default observer(List)
