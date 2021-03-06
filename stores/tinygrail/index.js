/*
 * 小圣杯
 * @Author: czy0729
 * @Date: 2019-08-24 23:18:17
 * @Last Modified by: czy0729
 * @Last Modified time: 2019-12-23 14:57:26
 */
import { observable, computed, toJS } from 'mobx'
import { getTimestamp, toFixed } from '@utils'
import store from '@utils/store'
import { HTMLDecode } from '@utils/html'
import { log } from '@utils/dev'
import axios from '@utils/thirdParty/axios'
import { LIST_EMPTY } from '@constants'
import {
  API_TINYGRAIL_CHARAS,
  API_TINYGRAIL_LIST,
  API_TINYGRAIL_RICH,
  API_TINYGRAIL_CHARTS,
  API_TINYGRAIL_DEPTH,
  API_TINYGRAIL_HASH,
  API_TINYGRAIL_ASSETS,
  API_TINYGRAIL_CHARA_ASSETS,
  API_TINYGRAIL_USER_CHARA,
  API_TINYGRAIL_BID,
  API_TINYGRAIL_ASK,
  API_TINYGRAIL_CANCEL_BID,
  API_TINYGRAIL_CANCEL_ASK,
  API_TINYGRAIL_CHARA_BID,
  API_TINYGRAIL_CHARA_ASKS,
  API_TINYGRAIL_MY_CHARA_ASSETS,
  API_TINYGRAIL_BALANCE,
  API_TINYGRAIL_INITIAL,
  API_TINYGRAIL_JOIN,
  API_TINYGRAIL_USERS,
  API_TINYGRAIL_TEMPLE,
  API_TINYGRAIL_CHARA_ALL,
  API_TINYGRAIL_CHARA_TEMPLE,
  API_TINYGRAIL_VALHALL_CHARA,
  API_TINYGRAIL_AUCTION_LIST,
  API_TINYGRAIL_AUCTION,
  API_TINYGRAIL_SACRIFICE,
  API_TINYGRAIL_VALHALL_LIST,
  API_TINYGRAIL_MY_AUCTION_LIST,
  API_TINYGRAIL_SCRATCH,
  API_TINYGRAIL_BONUS,
  API_TINYGRAIL_BONUS_DAILY,
  API_TINYGRAIL_ISSUE_PRICE,
  API_TINYGRAIL_TEMPLE_LAST
} from '@constants/api'
import {
  NAMESPACE,
  INIT_CHARACTERS_ITEM,
  INIT_RICH,
  INIT_KLINE_ITEM,
  INIT_DEPTH_ITEM,
  INIT_ASSETS,
  INIT_CHARA_ASSETS,
  INIT_USER_LOGS,
  INIT_MY_CHARA_ASSETS
} from './init'

const defaultKey = 'recent'
const defaultSort = '1/50'

class Tinygrail extends store {
  state = observable({
    /**
     * 授权cookie
     */
    cookie: '',

    /**
     * 人物数据
     */
    characters: {
      // [monoId]: INIT_CHARACTERS_ITEM
    },

    /**
     * 总览列表
     */
    mvc: LIST_EMPTY,
    mrc: LIST_EMPTY,
    mfc: LIST_EMPTY,
    mvi: LIST_EMPTY,
    mpi: LIST_EMPTY,
    rai: LIST_EMPTY,
    mri: LIST_EMPTY,
    recent: LIST_EMPTY,
    tnbc: LIST_EMPTY,
    nbc: LIST_EMPTY,
    msrc: LIST_EMPTY,

    /**
     * 番市首富
     */
    rich: INIT_RICH,

    /**
     * K线
     */
    kline: {
      // [monoId]: INIT_KLINE_ITEM
    },

    /**
     * 深度图
     */
    depth: {
      // [monoId]: INIT_DEPTH_ITEM
    },

    /**
     * 用户唯一标识
     */
    hash: '',

    /**
     * 用户资产
     */
    assets: INIT_ASSETS,

    /**
     * 用户资产概览信息
     */
    charaAssets: {
      // [hash]: INIT_CHARA_ASSETS
    },

    /**
     * 我的挂单和交易记录
     */
    userLogs: {
      // [monoId]: INIT_USER_LOGS
    },

    /**
     * 我的买单
     */
    bid: LIST_EMPTY,

    /**
     * 我的卖单
     */
    asks: LIST_EMPTY,

    /**
     * 我的持仓
     */
    myCharaAssets: INIT_MY_CHARA_ASSETS,

    /**
     * 资金日志
     */
    balance: LIST_EMPTY,

    /**
     * 记录所有角色的头像Map (用于没有头像的列表)
     */
    iconsCache: {
      // [monoId]: ''
    },

    /**
     * ICO参与者
     */
    initial: {
      // [monoId]: {}
    },

    /**
     * 董事会
     */
    users: {
      // [monoId]: LIST_EMPTY
    },

    /**
     * 用户圣殿
     */
    temple: {
      // [hash]: LIST_EMPTY<INIT_TEMPLE_ITEM>
    },

    /**
     * 用户所有角色信息
     */
    charaAll: {
      // [hash]: LIST_EMPTY<INIT_CHATACTER_ITEM>
    },

    /**
     * 角色圣殿
     */
    charaTemple: {
      // [monoId]: LIST_EMPTY
    },

    /**
     * 可拍卖信息
     */
    valhallChara: {
      // [monoId]: {}
    },

    /**
     * 上周拍卖记录
     */
    auctionList: {
      // [monoId]: LIST_EMPTY
    },

    /**
     * 英灵殿
     */
    valhallList: LIST_EMPTY,

    /**
     * 我的拍卖列表
     */
    auction: LIST_EMPTY,

    /**
     * 角色发行价
     */
    issuePrice: {
      // [monoId]: 0
    },

    /**
     * 最近圣殿
     */
    templeLast: LIST_EMPTY,

    /**
     * iOS此刻是否显示WebView
     * @issue 新的WKWebView已代替老的UIWebView, 但是当前版本新的有一个致命的问题,
     * 页面发生切换动作时, 会导致WebView重新渲染, 底色写死是白色, 在一些暗色调的页面里面,
     * 会导致闪白屏, 这个非常不友好, 暂时只想到通过维护一个全局变量去决定是否渲染WebView
     */
    _webview: true
  })

  init = () =>
    this.readStorage(
      [
        'cookie',
        'characters',
        'mvi',
        'recent',
        'nbc',
        'rich',
        'kline',
        'depth',
        'hash',
        'assets',
        'charaAssets',
        'userLogs',
        'bid',
        'asks',
        'myCharaAssets',
        'balance',
        'iconsCache',
        'temple',
        'charaAll',
        'charaTemple',
        'valhallList',
        'auction',
        'issuePrice'
      ],
      NAMESPACE
    )

  // -------------------- get --------------------
  @computed get cookie() {
    return this.state.cookie
  }

  characters(id) {
    return (
      computed(() => this.state.characters[id]).get() || INIT_CHARACTERS_ITEM
    )
  }

  list(key = defaultKey) {
    return computed(() => this.state[key]).get() || LIST_EMPTY
  }

  rich(sort = defaultSort) {
    return computed(() => this.state.rich[sort]).get() || LIST_EMPTY
  }

  kline(id) {
    return computed(() => this.state.kline[id]).get() || INIT_KLINE_ITEM
  }

  depth(id) {
    return computed(() => this.state.depth[id]).get() || INIT_DEPTH_ITEM
  }

  @computed get hash() {
    return this.state.hash
  }

  @computed get assets() {
    return this.state.assets
  }

  charaAssets(hash) {
    return (
      computed(() => this.state.charaAssets[hash]).get() || INIT_CHARA_ASSETS
    )
  }

  userLogs(id) {
    return computed(() => this.state.userLogs[id]).get() || INIT_USER_LOGS
  }

  @computed get myCharaAssets() {
    return this.state.myCharaAssets
  }

  @computed get balance() {
    return this.state.balance
  }

  iconsCache(id) {
    return computed(() => this.state.iconsCache[id]).get() || ''
  }

  initial(id) {
    return computed(() => this.state.initial[id]).get() || LIST_EMPTY
  }

  users(id) {
    return computed(() => this.state.users[id]).get() || LIST_EMPTY
  }

  temple(hash = this.hash) {
    return computed(() => this.state.temple[hash]).get() || LIST_EMPTY
  }

  charaAll(hash = this.hash) {
    return computed(() => this.state.charaAll[hash]).get() || LIST_EMPTY
  }

  charaTemple(id) {
    return computed(() => this.state.charaTemple[id]).get() || LIST_EMPTY
  }

  valhallChara(id) {
    return computed(() => this.state.valhallChara[id]).get() || {}
  }

  auctionList(id) {
    return computed(() => this.state.auctionList[id]).get() || LIST_EMPTY
  }

  @computed get valhallList() {
    return this.state.valhallList
  }

  issuePrice(id) {
    return computed(() => this.state.issuePrice[id]).get() || 0
  }

  @computed get templeLast() {
    return this.state.templeLast
  }

  // -------------------- fetch --------------------
  fetch = (url, isPost, data) => {
    log(`[axios] ${url}`)

    axios.defaults.withCredentials = false
    const config = {
      method: isPost ? 'post' : 'get',
      url,
      responseType: 'json',
      headers: {
        cookie: this.cookie
      }
    }
    if (data) {
      config.data = data
    }
    return axios(config)
  }

  /**
   * 人物数据
   */
  fetchCharacters = async ids => {
    const result = await this.fetch(API_TINYGRAIL_CHARAS(), true, ids)

    const { characters } = this.state
    const data = {
      ...characters
    }

    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      const target = Array.isArray(result.data.Value)
        ? result.data.Value
        : [result.data.Value]
      target.forEach(item => {
        const id = item.CharacterId || item.Id
        if (item.Icon) {
          iconsCache[id] = item.Icon
        }
        data[id] = {
          id,
          icoId: item.Id,
          bids: item.Bids,
          asks: item.Asks,
          change: item.Change,
          current: item.Current,
          fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
          total: item.Total,
          marketValue: item.MarketValue,
          lastOrder: item.LastOrder,
          end: item.End,
          users: item.Users,
          name: item.Name,
          icon: item.Icon,
          bonus: item.Bonus,
          rate: item.Rate,
          level: item.Level,
          _loaded: getTimestamp()
        }
      })
      this.updateIconsCache(iconsCache)
    }

    const key = 'characters'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 总览列表
   * @notice 需自行添加顺序index, 以支持二次排序显示
   */
  fetchList = async (key = defaultKey) => {
    const result = await this.fetch(API_TINYGRAIL_LIST(key))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data = {
        ...LIST_EMPTY,
        list: (result.data.Value.Items || result.data.Value).map(
          (item, index) => {
            const id = item.CharacterId || item.Id
            if (item.Icon) {
              iconsCache[id] = item.Icon
            }
            return {
              _index: index + 1,
              id,
              bids: item.Bids,
              asks: item.Asks,
              change: item.Change,
              current: item.Current,
              fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
              total: item.Total,
              marketValue: item.MarketValue,
              lastOrder: item.LastOrder,
              end: item.End,
              users: item.Users,
              name: item.Name,
              icon: item.Icon,
              bonus: item.Bonus,
              rate: item.Rate,
              level: item.Level
            }
          }
        ),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
      this.updateIconsCache(iconsCache)
    }

    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 番市首富
   */
  fetchRich = async (sort = defaultSort) => {
    const [page, limit] = sort.split('/')
    const result = await this.fetch(API_TINYGRAIL_RICH(page, limit))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.map(item => ({
          avatar: item.Avatar,
          nickname: HTMLDecode(item.Nickname),
          userId: item.Name,
          assets: toFixed(item.Assets, 2),
          total: toFixed(item.TotalBalance, 2),
          share: toFixed(item.Share, 2),
          principal: item.Principal,
          lastActiveDate: item.LastActiveDate,
          lastIndex: item.LastIndex
        })),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
    }

    const key = 'rich'
    const { rich } = this.state
    this.setState({
      [key]: {
        ...rich,
        [sort]: data
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * K线原始数据
   */
  fetchKline = async monoId => {
    const result = await this.fetch(API_TINYGRAIL_CHARTS(monoId), true)

    const data = {
      id: monoId,
      data: []
    }
    if (result.data.State === 0) {
      data._loaded = getTimestamp()
      data.data = result.data.Value.map(item => ({
        time: item.Time,
        begin: item.Begin,
        end: item.End,
        low: item.Low,
        high: item.High,
        amount: item.Amount,
        price: item.Price
      }))
    }

    const key = 'kline'
    this.setState({
      [key]: {
        [monoId]: data
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 深度图
   */
  fetchDepth = async monoId => {
    const result = await this.fetch(API_TINYGRAIL_DEPTH(monoId), true)

    const data = {
      ...INIT_DEPTH_ITEM
    }
    if (result.data.State === 0) {
      data._loaded = getTimestamp()
      data.asks = result.data.Value.Asks.map(item => ({
        price: item.Price,
        amount: item.Amount
      }))
      data.bids = result.data.Value.Bids.map(item => ({
        price: item.Price,
        amount: item.Amount
      }))
    }

    const key = 'depth'
    this.setState({
      [key]: {
        [monoId]: data
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 用户唯一标识
   */
  fetchHash = async () => {
    const result = await this.fetch(API_TINYGRAIL_HASH())

    let data = ''
    if (result.data.State === 0) {
      data = result.data.Value.Hash
    }

    const key = 'hash'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 资产信息
   */
  fetchAssets = async () => {
    const result = await this.fetch(API_TINYGRAIL_ASSETS())

    let data = {
      ...INIT_ASSETS
    }
    if (result.data.State === 0) {
      data = {
        id: result.data.Value.Id,
        balance: result.data.Value.Balance,
        _loaded: getTimestamp()
      }
    }

    const key = 'assets'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 用户资产概览信息
   */
  fetchCharaAssets = async hash => {
    const result = await this.fetch(API_TINYGRAIL_CHARA_ASSETS(hash))

    const data = {
      ...INIT_CHARA_ASSETS
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data._loaded = getTimestamp()
      data.id = result.data.Value.Id
      data.balance = result.data.Value.Balance
      data.characters = result.data.Value.Characters.map(item => {
        if (item.Icon) {
          iconsCache[item.Id] = item.Icon
        }
        return {
          id: item.Id,
          icon: item.Icon,
          name: item.Name,
          current: item.Current,
          state: item.State,
          total: item.Total,
          bonus: item.Bonus,
          rate: item.Rate,
          level: item.Level,
          marketValue: item.MarketValue,
          change: item.Change,
          fluctuation: item.Fluctuation
        }
      })
      data.initials = result.data.Value.Initials.map(item => {
        if (item.Icon) {
          iconsCache[item.Id] = item.Icon
        }
        return {
          id: item.Id,
          icon: item.Icon,
          name: item.Name,
          current: 0,
          state: item.State,
          total: item.Total,
          bonus: item.Bonus,
          rate: item.Rate,
          level: item.Level,
          marketValue: item.MarketValue,
          change: item.Change,
          fluctuation: item.Fluctuation
        }
      })
      this.updateIconsCache(iconsCache)
    }

    const key = 'charaAssets'
    this.setState({
      [key]: {
        [hash]: data
      }
    })
    // this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 英灵殿
   */
  fetchValhallList = async () => {
    const result = await this.fetch(API_TINYGRAIL_VALHALL_LIST(1, 100))

    const data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data._loaded = getTimestamp()
      data.list = result.data.Value.Items.map(item => {
        if (item.Icon) {
          iconsCache[item.Id] = item.Icon
        }
        return {
          id: item.Id,
          icon: item.Icon,
          name: item.Name,
          current: item.Current,
          state: item.State,
          total: item.Total,
          bids: item.Bids,
          asks: item.Asks,
          change: item.Change,
          fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
          marketValue: item.MarketValue,
          lastOrder: item.LastOrder,
          end: item.End,
          users: item.Users,
          bonus: item.Bonus,
          rate: item.Rate,
          level: item.Level,
          price: item.Price
        }
      })
      this.updateIconsCache(iconsCache)
    }

    const key = 'valhallList'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 用户挂单和交易记录
   */
  fetchUserLogs = async monoId => {
    const result = await this.fetch(API_TINYGRAIL_USER_CHARA(monoId))

    let data = {
      ...INIT_USER_LOGS
    }
    if (result.data.State === 0) {
      data = {
        id: result.data.Value.Id,
        amount: result.data.Value.Amount,
        balance: result.data.Value.Balance,
        askHistory: result.data.Value.AskHistory.map(item => ({
          id: item.Id,
          characterId: item.CharacterId,
          amount: item.Amount,
          price: item.Price,
          time: item.TradeTime
        })),
        asks: result.data.Value.Asks.map(item => ({
          id: item.Id,
          characterId: item.CharacterId,
          amount: item.Amount,
          price: item.Price,
          time: item.Begin
        })),
        bidHistory: result.data.Value.BidHistory.map(item => ({
          id: item.Id,
          characterId: item.CharacterId,
          amount: item.Amount,
          price: item.Price,
          time: item.TradeTime
        })),
        bids: result.data.Value.Bids.map(item => ({
          id: item.Id,
          characterId: item.CharacterId,
          amount: item.Amount,
          price: item.Price,
          time: item.Begin
        })),
        _loaded: getTimestamp()
      }
    }

    const key = 'userLogs'
    this.setState({
      [key]: {
        [monoId]: data
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 我的买单
   */
  fetchBid = async () => {
    const result = await this.fetch(API_TINYGRAIL_CHARA_BID())

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => {
          if (item.Icon) {
            iconsCache[item.Id] = item.Icon
          }
          return {
            id: item.Id,
            bids: item.Bids,
            asks: item.Asks,
            change: item.Change,
            current: item.Current,
            fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
            total: item.Total,
            marketValue: item.MarketValue,
            lastOrder: item.LastOrder,
            end: item.End,
            users: item.Users,
            name: item.Name,
            icon: item.Icon,
            bonus: item.Bonus,
            state: item.State,
            rate: item.Rate,
            level: item.Level
          }
        }),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
      this.updateIconsCache(iconsCache)
    }

    const key = 'bid'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 我的卖单
   */
  fetchAsks = async () => {
    const result = await this.fetch(API_TINYGRAIL_CHARA_ASKS())

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => {
          if (item.Icon) {
            iconsCache[item.Id] = item.Icon
          }
          return {
            id: item.Id,
            bids: item.Bids,
            asks: item.Asks,
            change: item.Change,
            current: item.Current,
            fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
            total: item.Total,
            marketValue: item.MarketValue,
            lastOrder: item.LastOrder,
            end: item.End,
            users: item.Users,
            name: item.Name,
            icon: item.Icon,
            bonus: item.Bonus,
            state: item.State,
            rate: item.Rate,
            level: item.Level
          }
        }),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
      this.updateIconsCache(iconsCache)
    }

    const key = 'asks'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 我的拍卖列表
   */
  fetchAuction = async () => {
    const result = await this.fetch(API_TINYGRAIL_MY_AUCTION_LIST())

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => {
          if (item.Icon) {
            iconsCache[item.CharacterId] = item.Icon
          }

          // <INIT_AUCTION_ITEM>
          return {
            id: item.Id,
            monoId: item.CharacterId,
            name: item.Name,
            icon: item.Icon,
            marketValue: item.MarketValue,
            total: item.Total,
            rate: item.Rate,
            level: item.Level,
            amount: item.Amount,
            price: item.Price,
            state: item.State,
            lastOrder: item.Bid
          }
        }),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
      this.updateIconsCache(iconsCache)
    }

    const key = 'auction'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 我的持仓
   */
  fetchMyCharaAssets = async () => {
    const result = await this.fetch(API_TINYGRAIL_MY_CHARA_ASSETS())

    let data = {
      ...INIT_MY_CHARA_ASSETS
    }
    if (result.data.State === 0) {
      const iconsCache = toJS(this.state.iconsCache)
      data = {
        chara: {
          list: result.data.Value.Characters.map(item => {
            if (item.Icon) {
              iconsCache[item.Id] = item.Icon
            }
            return {
              id: item.Id,
              monoId: item.CharacterId,
              bids: item.Bids,
              asks: item.Asks,
              change: item.Change,
              current: item.Current,
              fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
              total: item.Total,
              marketValue: item.MarketValue,
              lastOrder: item.LastOrder,
              end: item.End,
              users: item.Users,
              name: item.Name,
              icon: item.Icon,
              bonus: item.Bonus,
              state: item.State,
              rate: item.Rate,
              level: item.Level
            }
          }),
          pagination: {
            page: 1,
            pageTotal: 1
          },
          _loaded: getTimestamp()
        },
        ico: {
          list: result.data.Value.Initials.map(item => {
            if (item.Icon) {
              iconsCache[item.Id] = item.Icon
            }
            return {
              id: item.Id,
              monoId: item.CharacterId,
              bids: item.Bids,
              asks: item.Asks,
              change: item.Change,
              current: item.Current,
              fluctuation: item.Fluctuation ? item.Fluctuation * 100 : '',
              total: item.Total,
              marketValue: item.MarketValue,
              lastOrder: item.LastOrder,
              end: item.End,
              users: item.Users,
              name: item.Name,
              icon: item.Icon,
              bonus: item.Bonus,
              state: item.State,
              rate: item.Rate,
              level: item.Level
            }
          }),
          pagination: {
            page: 1,
            pageTotal: 1
          },
          _loaded: getTimestamp()
        },
        _loaded: getTimestamp()
      }
      this.updateIconsCache(iconsCache)
    }

    const key = 'myCharaAssets'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * ICO参与者
   */
  fetchInitial = async monoId => {
    const result = await this.fetch(API_TINYGRAIL_INITIAL(monoId))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => ({
          id: item.InitialId,
          avatar: item.Avatar,
          userId: item.UserId,
          state: item.State,
          nickName: HTMLDecode(item.NickName),
          name: item.Name,
          amount: item.Amount
        })),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
    }

    const key = 'initial'
    this.setState({
      [key]: {
        [monoId]: data
      }
    })

    return Promise.resolve(data)
  }

  /**
   * 资金日志
   */
  fetchBalance = async () => {
    const result = await this.fetch(API_TINYGRAIL_BALANCE())

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => ({
          id: item.Id,
          balance: item.Balance,
          change: item.Change,
          time: item.LogTime,
          charaId: item.RelatedId,
          desc: item.Description
        })),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        _loaded: getTimestamp()
      }
    }

    const key = 'balance'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 董事会
   */
  fetchUsers = async monoId => {
    const result = await this.fetch(API_TINYGRAIL_USERS(monoId))

    let data = []
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => ({
          id: item.Id,
          nickName: item.Nickname,
          avatar: item.Avatar,
          balance: item.Balance,
          name: item.Name
        })),
        pagination: {
          page: 1,
          pageTotal: 1
        },
        total: result.data.Value.TotalItems,
        _loaded: getTimestamp()
      }
    }

    const key = 'users'
    this.setState({
      [key]: {
        [monoId]: data
      }
    })

    return Promise.resolve(data)
  }

  /**
   * 用户圣殿
   */
  fetchTemple = async (hash = this.hash) => {
    const result = await this.fetch(API_TINYGRAIL_TEMPLE(hash))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => ({
          id: item.CharacterId,
          cover: item.Cover,
          name: item.Name,
          sacrifices: item.Sacrifices,
          rate: item.Rate,
          level: item.Level
        })),
        _loaded: getTimestamp()
      }
    }

    const key = 'temple'
    this.setState({
      [key]: {
        [hash]: data
      }
    })
    if (hash === this.hash) {
      this.setStorage(key, undefined, NAMESPACE)
    }

    return Promise.resolve(data)
  }

  /**
   * 用户资产概览信息
   */
  fetchCharaAll = async (hash = this.hash) => {
    const result = await this.fetch(API_TINYGRAIL_CHARA_ALL(hash))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.Items.map(item => ({
          id: item.Id,
          icon: item.Icon,
          name: item.Name,
          current: item.Current,
          state: item.State,
          total: item.Total,
          bonus: item.Bonus,
          rate: item.Rate,
          level: item.Level,
          marketValue: item.MarketValue,
          change: item.Change,
          fluctuation: item.Fluctuation
        })),
        _loaded: getTimestamp()
      }
    }

    const key = 'charaAll'
    this.setState({
      [key]: {
        [hash]: data
      }
    })
    if (hash === this.hash) {
      this.setStorage(key, undefined, NAMESPACE)
    }

    return Promise.resolve(data)
  }

  /**
   * 角色圣殿
   */
  fetchCharaTemple = async (id = 0) => {
    const result = await this.fetch(API_TINYGRAIL_CHARA_TEMPLE(id))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.map(item => ({
          avatar: item.Avatar,
          id: item.CharacterId,
          cover: item.Cover,
          name: item.Name,
          nickname: item.Nickname,
          level: item.Level,
          sacrifices: item.Sacrifices
        })),
        _loaded: getTimestamp()
      }
    }

    const key = 'charaTemple'
    this.setState({
      [key]: {
        [id]: data
      }
    })
    // this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 可拍卖信息
   */
  fetchValhallChara = async (id = 0) => {
    const result = await this.fetch(API_TINYGRAIL_VALHALL_CHARA(id))

    let data = {}
    const { State, Value } = result.data
    if (State === 0) {
      data = {
        amount: Value.Amount,
        price: Value.Price,
        _loaded: getTimestamp()
      }
    }

    const key = 'valhallChara'
    this.setState({
      [key]: {
        [id]: data
      }
    })

    return Promise.resolve(data)
  }

  /**
   * 上周拍卖记录
   */
  fetchAuctionList = async (id = 0) => {
    const result = await this.fetch(API_TINYGRAIL_AUCTION_LIST(id))

    let data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data = {
        ...LIST_EMPTY,
        list: result.data.Value.map(item => ({
          id: item.CharacterId,
          name: item.Username,
          nickname: item.Nickname,
          time: (item.Bid || '').replace('T', ' ').substring(2, 16),
          price: item.Price,
          amount: item.Amount,
          state: item.State
        })),
        _loaded: getTimestamp()
      }
    }

    const key = 'auctionList'
    this.setState({
      [key]: {
        [id]: data
      }
    })

    return Promise.resolve(data)
  }

  /**
   * 角色发行价
   */
  fetchIssuePrice = async (id = 0) => {
    // 发行价一旦有数据就不会改变, 不需要再请求
    if (this.issuePrice[id]) {
      return this.issuePrice[id]
    }

    const result = await this.fetch(API_TINYGRAIL_ISSUE_PRICE(id))
    let data = 0
    if (result.data.State === 0) {
      if (result.data.Value.length) {
        data = result.data.Value[0].Begin
      }
    }

    const key = 'issuePrice'
    this.setState({
      [key]: {
        [id]: data
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return Promise.resolve(data)
  }

  /**
   * 最近圣殿
   */
  fetchTempleLast = async () => {
    const result = await this.fetch(API_TINYGRAIL_TEMPLE_LAST())

    const data = {
      ...LIST_EMPTY
    }
    if (result.data.State === 0) {
      data._loaded = getTimestamp()
      data.list = result.data.Value.Items.map(item => ({
        id: item.CharacterId,
        userId: item.Name,
        cover: item.Cover,
        name: item.CharacterName,
        nickname: item.Nickname,
        level: item.Level,
        rate: item.Rate
      }))
    }

    const key = 'templeLast'
    this.setState({
      [key]: data
    })

    return Promise.resolve(data)
  }

  // -------------------- page --------------------
  updateCookie = cookie => {
    this.setState({
      cookie
    })
    this.setStorage('cookie', undefined, NAMESPACE)
  }

  updateIconsCache = iconsCache => {
    this.setState({
      iconsCache
    })
    this.setStorage('iconsCache', undefined, NAMESPACE)
  }

  updateWebViewShow = show => {
    this.setState({
      _webview: show
    })
  }

  // -------------------- action --------------------
  /**
   * 买入
   */
  doBid = async ({ monoId, price, amount }) => {
    const result = await this.fetch(
      API_TINYGRAIL_BID(monoId, price, amount),
      true
    )
    if (result.data.State === 0) {
      return true
    }
    return false
  }

  /**
   * 卖出
   */
  doAsk = async ({ monoId, price, amount }) => {
    const result = await this.fetch(
      API_TINYGRAIL_ASK(monoId, price, amount),
      true
    )
    if (result.data.State === 0) {
      return true
    }
    return false
  }

  /**
   * 取消买入
   */
  doCancelBid = async ({ id }) => {
    const result = await this.fetch(API_TINYGRAIL_CANCEL_BID(id), true)
    if (result.data.State === 0) {
      return true
    }
    return false
  }

  /**
   * 取消卖出
   */
  doCancelAsk = async ({ id }) => {
    const result = await this.fetch(API_TINYGRAIL_CANCEL_ASK(id), true)
    if (result.data.State === 0) {
      return true
    }
    return false
  }

  /**
   * 参与ICO
   */
  doJoin = async ({ id, amount }) => {
    const result = await this.fetch(API_TINYGRAIL_JOIN(id, amount), true)
    if (result.data.State === 0) {
      return true
    }
    return false
  }

  /**
   * 资产重组
   */
  doSacrifice = async ({ monoId, amount, isSale }) => {
    const { data } = await this.fetch(
      API_TINYGRAIL_SACRIFICE(monoId, amount, isSale),
      true
    )
    return data
  }

  /**
   * 拍卖
   */
  doAuction = async ({ monoId, price, amount }) => {
    const { data } = await this.fetch(
      API_TINYGRAIL_AUCTION(monoId, price, amount),
      true
    )
    return data
  }

  /**
   * 刮刮乐
   */
  doLottery = async () => {
    const { data } = await this.fetch(API_TINYGRAIL_SCRATCH(), true)
    return data
  }

  /**
   * 每周分红
   */
  doBonus = async () => {
    const { data } = await this.fetch(API_TINYGRAIL_BONUS(), true)
    return data
  }

  /**
   * 每日签到
   */
  doBonusDaily = async () => {
    const { data } = await this.fetch(API_TINYGRAIL_BONUS_DAILY(), true)
    return data
  }
}

export default new Tinygrail()
