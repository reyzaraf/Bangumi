/*
 * @Author: czy0729
 * @Date: 2019-04-08 01:25:26
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-08 02:12:59
 */
import React from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { observer } from 'mobx-react'
import { Image, Text, Touchable } from '@components'
import { _ } from '@stores'
import { findBangumiCn } from '@utils/app'
import { IMG_DEFAULT } from '@constants'

function HorizontalList({
  style,
  data,
  width,
  height,
  quality,
  findCn,
  onPress
}) {
  return (
    <ScrollView
      style={style}
      contentContainerStyle={styles.contentContainerStyle}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {data.map((item, index) => (
        <View
          key={item.id}
          style={[
            {
              width
            },
            index !== 0 && _.ml.md
          ]}
        >
          <Image
            size={width}
            height={height}
            src={item.image || IMG_DEFAULT}
            radius
            border
            shadow
            quality={quality}
            onPress={() => onPress(item)}
          />
          <Touchable withoutFeedback onPress={() => onPress(item)}>
            <Text style={_.mt.sm} numberOfLines={2}>
              {findCn ? findBangumiCn(item.name) : item.name}
            </Text>
            {!!item.desc && (
              <Text style={_.mt.xs} type='sub' size={12} numberOfLines={1}>
                {item.desc}
              </Text>
            )}
          </Touchable>
        </View>
      ))}
    </ScrollView>
  )
}

HorizontalList.defaultProps = {
  data: [],
  width: 72,
  height: 72,
  quality: false,
  findCn: false,
  onPress: Function.prototype
}

export default observer(HorizontalList)

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingVertical: 4,
    paddingHorizontal: _.wind
  }
})
