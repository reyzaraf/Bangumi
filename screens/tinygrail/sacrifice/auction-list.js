/*
 * @Author: czy0729
 * @Date: 2019-11-17 14:24:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-22 18:02:40
 */
import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import { Flex, Text, Mesume } from '@components'
import { _ } from '@stores'
import { formatNumber } from '@utils'
import { observer } from '@utils/decorators'
import { t } from '@utils/fetch'

function AuctionList({ style }, { $, navigation }) {
  const styles = memoStyles()
  const { list, _loaded } = $.auctionList
  let successCount = 0
  let successAmount = 0
  list
    .filter(item => item.state === 1)
    .forEach(item => {
      successCount += 1
      successAmount += item.amount
    })
  return (
    <View style={[styles.container, style]}>
      {_loaded && (
        <View style={styles.info}>
          {list.length ? (
            <Text
              style={{
                color: _.colorTinygrailPlain
              }}
            >
              上周公示：共 {list.length || '-'} 人拍卖，成功{' '}
              {successCount || '-'} 人 /{' '}
              {successAmount ? formatNumber(successAmount, 0) : '-'} 股
            </Text>
          ) : (
            <Flex style={_.mt.md} direction='column'>
              <Mesume />
              <Text
                style={[
                  _.mt.sm,
                  {
                    color: _.colorTinygrailPlain
                  }
                ]}
              >
                上周没有拍卖纪录
              </Text>
            </Flex>
          )}
        </View>
      )}
      {list
        .sort((a, b) => b.price - a.price)
        .map(item => {
          const isSuccess = item.state === 1
          return (
            <Flex
              key={`${item.time}|${item.price}|${item.amount}`}
              style={styles.item}
            >
              <Text
                style={{
                  width: 96,
                  color: _.colorTinygrailText
                }}
                size={12}
              >
                {item.time}
              </Text>
              <Flex.Item style={_.ml.sm}>
                <Text
                  style={{
                    color: _.colorTinygrailPlain
                  }}
                  size={12}
                  onPress={() => {
                    t('资产重组.跳转', {
                      to: 'Zone',
                      from: '竞拍列表',
                      monoId: $.monoId,
                      userId: item.name
                    })

                    navigation.push('Zone', {
                      userId: item.name
                    })
                  }}
                >
                  {item.nickname}
                </Text>
              </Flex.Item>
              <Flex.Item style={_.ml.sm}>
                <Text
                  style={{
                    color: _.colorTinygrailText
                  }}
                  size={12}
                >
                  ₵{item.price} / {formatNumber(item.amount, 0)}
                </Text>
              </Flex.Item>
              <Text
                style={[
                  {
                    color: isSuccess ? _.colorBid : _.colorAsk
                  },
                  _.ml.sm
                ]}
                size={12}
              >
                {isSuccess ? '成功' : '失败'}
              </Text>
            </Flex>
          )
        })}
    </View>
  )
}

AuctionList.contextTypes = {
  $: PropTypes.object,
  navigation: PropTypes.object
}

export default observer(AuctionList)

const memoStyles = _.memoStyles(_ => ({
  container: {
    padding: _.wind
  },
  info: {
    paddingBottom: _.sm
  },
  item: {
    paddingVertical: _.sm,
    borderBottomColor: _.colorTinygrailBorder,
    borderBottomWidth: _.hairlineWidth
  }
}))
