/*
 * @Author: czy0729
 * @Date: 2019-03-26 05:09:58
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-19 16:19:23
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Expand } from '@components'
import { SectionTitle, ItemArticle } from '@screens/_'
import { _ } from '@stores'

function Topic({ style }, { $, navigation }) {
  const { topic } = $.subject
  if (!(topic || []).length) {
    return null
  }

  return (
    <Expand style={style} ratio={2}>
      <SectionTitle style={{ paddingLeft: _.wind }}>讨论版</SectionTitle>
      <View style={_.mt.sm}>
        {topic.map((item, index) => (
          <ItemArticle
            key={item.id}
            style={{
              paddingLeft: _.wind
            }}
            navigation={navigation}
            index={index}
            avatar={item.user.avatar.small}
            title={item.title}
            summary={item.summary}
            nickname={item.user.nickname}
            timestamp={item.timestamp}
            replies={item.replies}
            url={item.url}
            event={{
              id: '条目.跳转',
              data: {
                from: '讨论版',
                subjectId: $.subjectId
              }
            }}
          />
        ))}
      </View>
    </Expand>
  )
}

Topic.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(Topic)
