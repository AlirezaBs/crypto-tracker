
import globalAddEventListener from "./util/globalAddEventListener"

const tableBody = document.querySelector("#table-body")
const tableRowTemplate = document.querySelector("#coin-table-row")
const tableSection = document.querySelector("#table-section")
const spinner = document.querySelector("#spinner")
const spinner2 = document.querySelector("#spinner2")

let globalData = {}
let allCoins = []
let updatingCoins = []
let updateLimit = 30
let start = 0

export async function setCoins() {
  // first time getting data
  await getGlobalData()
  renderGlobalData()
  await getData()
  allCoins.forEach((coin) => renderCoins(coin))
  tableSection.classList.remove("invisible")
  spinner.classList.add("invisible")

  // load more coins
  globalAddEventListener("click", "[data-load-more]", (e) => loadMore())

  // updating data
  setInterval(() => {
    updateGlobalData()
    updateData()
  }, 10000)

  // search box
  globalAddEventListener('input', '[data-search-input]', (e) => searchCoins(e))

  // add to favorite
  globalAddEventListener('click', '[data-add-favorite]', (e) => addCoinToFavorite(e))
}

async function updateGlobalData() { 
  await getGlobalData()
  renderGlobalData()
}

async function updateData() {
  await getUpdatedData()
  mergeLists()
  allCoins.forEach((coin) => mergeDataWithNode(coin))
}

async function getGlobalData() {
  try {
    const response = await fetch("https://api.coinlore.net/api/global/")
    const data = await response.json()
    globalData = {
      volume: data[0].total_volume,
      avgChange: parseFloat(data[0].avg_change_percent),
      volumeChange: parseFloat(data[0].volume_change),
    }
  } catch (err) {
    console.log(err)
  }
}

async function getData() {
  try {
    const response = await fetch(
      `https://api.coinlore.net/api/tickers/?start=${start}&limit=30`
    )
    const data = await response.json()
    data.data.forEach((coin) => {
      allCoins.push({
        name: coin.name,
        rank: coin.rank,
        symbol: coin.symbol,
        id: parseInt(coin.id),
        price: coin.price_usd,
        changesDay: parseFloat(coin.percent_change_24h),
        changesHour: parseFloat(coin.percent_change_1h),
        changesWeek: parseFloat(coin.percent_change_7d),
        isFavorite: false,
        image: `https://cdn.arzdigital.com/uploads/assets/coins/icons/32x32/${coin.name
          .replaceAll(" ", "-")
          .toLowerCase()}.png`,
      })
    })
  } catch (err) {
    alert("Low Internet connection!!")
    console.error(err)
  }
}

async function getUpdatedData() {
  try {
    const response = await fetch(
      `https://api.coinlore.net/api/tickers/?start=0&limit=${updateLimit}`
    )
    const data = await response.json()
    updatingCoins.length = 0
    data.data.forEach((coin) => {
      updatingCoins.push({
        id: parseInt(coin.id),
        price: coin.price_usd,
        changesDay: parseFloat(coin.percent_change_24h),
        changesHour: parseFloat(coin.percent_change_1h),
        changesWeek: parseFloat(coin.percent_change_7d),
      })
    })
  } catch (err) {
    console.log(err)
  }
}

function addCoinToFavorite(e) {
  const tableRow = e.target.closest('[data-id]')
  const id = tableRow.dataset.coinId

  const coin = allCoins.find(i => i.id == id)

  if(coin.isFavorite){
    e.target.classList.toggle('fa-solid', false)
    e.target.classList.toggle('fa-regulaar', true)

    coin.isFavorite = false
  }else {
    e.target.classList.toggle('fa-solid', true)
    e.target.classList.toggle('fa-regulaar', false)

    coin.isFavorite = true
  }
}


function searchCoins(e) {
  e.preventDefault()
  const searchText = e.target.value.toLowerCase()

  allCoins.forEach(coin => {
    const tableRow = tableBody.querySelector(`[data-coin-id="${coin.id}"`)

    if (coin.name.toLowerCase().includes(searchText) || coin.symbol.toLowerCase().includes(searchText)){
      tableRow.classList.toggle('hidden', false)
    }else {
      tableRow.classList.toggle('hidden', true)  
    }
  })
}

function mergeLists() {
  allCoins.forEach((coinData) => {
    let updatedCoin = updatingCoins.find((i) => i.id === coinData.id)
    if (typeof updateData !== undefined) {
      coinData.price = updatedCoin.price
      coinData.changesDay = updatedCoin.changesDay
      coinData.changesHour = updatedCoin.changesHour
      coinData.changesWeek = updatedCoin.changesWeek
    }
  })
}

async function loadMore() {
  spinner2.classList.remove("invisible")
  start += 30
  updateLimit += 30
  await getData()
  for (let i = start; i < updateLimit; i++) {
    renderCoins(allCoins[i])
  }
  spinner2.classList.add("invisible")
}

function renderGlobalData() {
  const volume = document.querySelector("[data-total-volume]")
  volume.innerText = globalData.volume

  const avgChange = document.querySelector("[data-avg-change]")
  avgChange.innerText = `${globalData.avgChange}%`
  if (globalData.avgChange >= 0) {
    avgChange.classList.add("text-green-400")
  } else {
    avgChange.classList.add("text-red-500")
  }

  const volumeChange = document.querySelector("[data-volume-change]")
  volumeChange.innerText = `${globalData.volumeChange}%`
  if (globalData.volumeChange >= 0) {
    volumeChange.classList.add("text-green-400")
  } else {
    volumeChange.classList.add("text-red-500")
  }
}

function mergeDataWithNode(coinData) {
  const tableRow = tableBody.querySelector(`[data-coin-id="${coinData.id}"`)

  const dataPrice = tableRow.querySelector("[data-price]")
  dataPrice.innerText = coinData.price

  const dataChangesDay = tableRow.querySelector("[data-changes-24h]")
  dataChangesDay.innerText = `${coinData.changesDay}%`
  if (coinData.changesDay >= 0) {
    dataChangesDay.classList.add("text-green-500")
  } else {
    dataChangesDay.classList.add("text-red-500")
  }

  const dataChangesHour = tableRow.querySelector("[data-changes-1h]")
  dataChangesHour.innerText = `${coinData.changesHour}%`
  if (coinData.changesHour >= 0) {
    dataChangesHour.classList.add("text-green-500")
  } else {
    dataChangesHour.classList.add("text-red-500")
  }

  const dataChangesWeek = tableRow.querySelector("[data-changes-7d]")
  dataChangesWeek.innerText = `${coinData.changesWeek}%`
  if (coinData.changesWeek >= 0) {
    dataChangesWeek.classList.add("text-green-500")
  } else {
    dataChangesWeek.classList.add("text-red-500")
  }
}

function renderCoins(coinData) {
  const tableRowClone = tableRowTemplate.content.cloneNode(true)

  const rowId = tableRowClone.querySelector("[data-id]")
  rowId.dataset.coinId = coinData.id

  const dataRank = tableRowClone.querySelector("[data-rank]")
  dataRank.innerText = coinData.rank

  const dataImage = tableRowClone.querySelector("[data-image]")
  dataImage.src = coinData.image

  const dataName = tableRowClone.querySelector("[data-name]")
  dataName.innerText = coinData.name

  const dataSymbol = tableRowClone.querySelector("[data-symbol]")
  dataSymbol.innerText = coinData.symbol

  const dataPrice = tableRowClone.querySelector("[data-price]")
  dataPrice.innerText = coinData.price

  const dataChangesDay = tableRowClone.querySelector("[data-changes-24h]")
  dataChangesDay.innerText = `${coinData.changesDay}%`
  if (coinData.changesDay >= 0) {
    dataChangesDay.classList.add("text-green-500")
  } else {
    dataChangesDay.classList.add("text-red-500")
  }

  const dataChangesHour = tableRowClone.querySelector("[data-changes-1h]")
  dataChangesHour.innerText = `${coinData.changesHour}%`
  if (coinData.changesHour >= 0) {
    dataChangesHour.classList.add("text-green-500")
  } else {
    dataChangesHour.classList.add("text-red-500")
  }

  const dataChangesWeek = tableRowClone.querySelector("[data-changes-7d]")
  dataChangesWeek.innerText = `${coinData.changesWeek}%`
  if (coinData.changesWeek >= 0) {
    dataChangesWeek.classList.add("text-green-500")
  } else {
    dataChangesWeek.classList.add("text-red-500")
  }

  const addToFavorite = tableRowClone.querySelector("[data-add-favorite]")
  if (coinData.isFavorite) {
    addToFavorite.classList.add("fas")
    addToFavorite.classList.remove("fa-regular")
  } else {
    addToFavorite.classList.add("fa-regular")
    addToFavorite.classList.remove("fas")
  }

  tableBody.appendChild(tableRowClone)
}
