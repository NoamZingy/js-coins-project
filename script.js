const DOM = {
  content: document.getElementById('content'),
  loader: document.getElementById('loader'),
  state: document.getElementById('state'),
  modal: document.getElementById('modalcontent'),
};

const CONFIG = {
  COINS_URL: `https://api.coingecko.com/api/v3/coins/list`,
  COINS_URL_BY_VALUE: `https://api.coingecko.com/api/v3/coins/`,
};

let userCoins = [];
let allCoinsArr = [];
let filterArry = [];

function getState() {
  try {
    const result = JSON.parse(localStorage.getItem('userCoins')) || [];
    return result;
  } catch (ex) {
    console.error('Local Storage is currupted ');
    return [];
  }
}

function init() {
  userCoins = getState();

  getCoinsApi();
}

init();

async function getCoinsApi() {
  try {
    const result = await fetch(`${CONFIG.COINS_URL}`);
    const initResult = await result.json();
    DOM.loader.style.display = 'none';
    initResult.length = 50;
    allCoinsArr = [];
    for (let i = 0; i < 50; i++) allCoinsArr.push(initResult[i]);

    console.log(initResult);
    console.log('arry', allCoinsArr);
    if (DOM.state.innerHTML == 'Home') draw(initResult);
    else if (DOM.state.innerHTML == 'my favorites') draw(userCoins);
  } catch {
    alert('Failed to fetch data from API');
  }
}

function filterCoins() {
  const seacrhValue = document.getElementById('search').value.toLowerCase();
  filterArry = allCoinsArr.filter((coin) => {
    return (
      coin.symbol.includes(seacrhValue.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(seacrhValue.toLowerCase())
    );
  });

  draw(filterArry);
}

function draw(coins) {
  if (!Array.isArray(coins)) return;
  content.innerHTML = ' ';
  const CoinsCard = coins.map((coin) => getCoinsCard(coin));
  DOM.content.append(...CoinsCard);
}

function getCoinsCard(coinsData) {
  const divCard = document.createElement('div');
  divCard.className = 'card m-2';
  divCard.style = 'width: 18rem;';

  const divBody = document.createElement('div');
  divBody.className = 'card-body';

  const h5 = document.createElement('h5');
  h5.className = 'card-title';
  h5.innerText = coinsData.symbol;

  const p = document.createElement('p');
  p.innerText = `ID:${coinsData.id}, Name:${coinsData.name}`;

  const divCollapse = document.createElement('div');
  const divCollapseBody = document.createElement('div');
  divCollapse.className = 'collapse';
  divCollapseBody.className = 'card card-body m-2';
  divCollapse.id = `more_info_${coinsData.id}`;
  divCollapse.append(divCollapseBody);

  const anchor = document.createElement('a');
  anchor.innerText = 'More info';
  anchor.href = `#more_info_${coinsData.id}`;
  anchor.className = 'btn btn-dark m-2';
  anchor.setAttribute('data-toggle', 'collapse');
  anchor.addEventListener('click', async function () {
    divCollapseBody.innerHTML = ' ';
    DOM.loader.style.display = 'block';
    const result = await fetch(
      `${CONFIG.COINS_URL_BY_VALUE}${coinsData.id}`,
      coinsData
    );
    const moreResult = await result.json();
    DOM.loader.style.display = 'none';
    console.log(moreResult);

    const moreInfo = {
      img: moreResult.image.thumb,
      coinByUSD: moreResult.market_data.current_price.usd,
      cooinByILS: moreResult.market_data.current_price.ils,
      cooinByEUR: moreResult.market_data.current_price.eur,
    };

    const coinSymbol = document.createElement('img');
    coinSymbol.className = 'img-coinSymbol';
    coinSymbol.src = moreInfo.img;
    coinSymbol.width = 60;

    const USD = showMoreInfo(moreInfo.coinByUSD, `$`);
    const ILS = showMoreInfo(moreInfo.cooinByILS, '₪');
    const EUR = showMoreInfo(moreInfo.cooinByEUR, '€');

    function showMoreInfo(text, symbol) {
      const Divlist = document.createElement('div');
      Divlist.innerText = `Value in:${text.toFixed()}${symbol}`;
      divCollapseBody.append(Divlist, coinSymbol);
      return Divlist;
    }
  });
  const checkboxButton = document.createElement('div');
  checkboxButton.className = 'form-check form-switch';
  checkboxButton.id = `SwitchCheck${coinsData.id}`;
  const checkbox = document.createElement('input');
  checkbox.className = 'form-check-input';
  checkbox.type = 'checkbox';
  checkbox.id = `#myCheck${coinsData.id}`;

  checkbox.addEventListener('click', () => {
    addTouserCoins(coinsData);
  });
  checkboxButton.append(checkbox);

  const deleteBtn = document.createElement('btn');
  deleteBtn.className = 'btn btn-success';
  deleteBtn.innerHTML = 'remove from favorite';
  deleteBtn.addEventListener('click', () => {
    deleteFromFav(coinsData);
  });

  if (DOM.state.innerHTML == 'Home') {
    divCard.append(divBody, checkboxButton, h5, p, anchor, divCollapse);
  } else {
    divCard.append(divBody, h5, p, anchor, divCollapse, deleteBtn);
  }
  return divCard;
}

function deleteFromFav(coinsData) {
  userCoins.splice(coinsData, 1);
  localStorage.setItem('userCoins', JSON.stringify(userCoins));
  if (userCoins == null) alert('you dont have favorite coins');
  else draw(userCoins);
}

function addTouserCoins(coinsData) {
  const index = document.getElementById(`#myCheck${coinsData.id}`);
  if (index.checked) {
    const isAlreadyExist = userCoins.some((c) => c.id === coinsData.id);
    if (isAlreadyExist) {
      index.checked = !index.checked;
      alert('The coin is already exist');
      return;
    }
    if (userCoins.length < 2) {
      userCoins.push(coinsData);
      /*   const localStorage = localStorage.setItem(`${coinsData.id}`, JSON.stringify(extendedCoin)) */

      localStorage.setItem('userCoins', JSON.stringify(userCoins));
      console.log('selectedCoinToStore', userCoins);
    } else return _getModal(userCoins, coinsData.id);
  } else {
    const deletedIndex = userCoins.findIndex((C) => C.id === coinsData.id);
    if (deletedIndex === -1) return;
    userCoins.splice(deletedIndex, 1);
    localStorage.setItem('userCoins', JSON.stringify(userCoins));
    console.log(userCoins);
  }
}
function _getModal(userCoins) {
  DOM.modal.innerHTML = ' ';

  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-dialog';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const modalHeader = document.createElement('div');
  modalHeader.classList.add('modal-header');
  modalHeader.id = 'exampleModalLabel';

  const h5 = document.createElement('h5');
  h5.classList = 'modal-title';
  h5.innerText = 'max favorites is 5. please choose which coin to delete';
  modalHeader.append(h5);

  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');
  const p = document.createElement('p');
  p.innerText = 'Please choose which coin do you want to delete';
  const alluserCoins = creatOptions(userCoins);
  modalBody.append(...alluserCoins, p);

  const modalFooter = document.createElement('div');
  modalFooter.classList.add('modal-footer');
  const cancleBT = _getActionButton('cancel', 'btn btn-primary', () =>  deleteSelected(userCoins) );
  cancleBT.setAttribute('data-dismiss', 'modal');
  const saveBT = _getActionButton('delete', 'btn btn-danger', () =>  saveSelected(userCoins));
  modalFooter.append(cancleBT, saveBT);

  function _getActionButton(title, className, action) {
    const button = document.createElement('button');
    button.className = `btn ml-5 btn-${className}`;
    button.innerText = title;
    button.addEventListener('click', action);
    return button;
  }

  modalContent.append(modalHeader, modalBody, modalFooter);
  modalDiv.append(modalContent);
  DOM.modal.append(modalDiv);
  $('#modalcontent').modal('toggle');
}

function creatOptions() {
  const coinsOptions = userCoins.map((coin) => {
    return _userCoins(coin.id, coin.symbol);
  });
  return coinsOptions;

  function _userCoins(Id , CLASS) {
    const divCheckBox = document.createElement('div');
    divCheckBox.className = 'custom-checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.id = `checkBox${Id}`;
    const lable = document.createElement('label');
    lable.className = 'custom-control-label';
    lable.setAttribute('for', `checkBox${Id}`);
    lable.innerText = CLASS;
    divCheckBox.append(input, lable);
    return divCheckBox;
  }
}

deleteSelected = (coinToDelete) => {
  index = document.getElementById(`SwitchCheck${coinToDelete.id}`);
  index.checked = !index.checked;
  $('#modalcontent').modal('hide');
};

saveSelected = (saveNewCoin) => {
  const currentCoin = userCoins.filter((coin) => {
    const coinID = document.getElementById(`checkBox${coin.id}`);
    if (coinID.checked) return coin;
  });

  currentCoin.map((coin) => {
    const IndexsToDel = userCoins.findIndex((indexCoin) => {
      return coin.id === indexCoin.id;
    });
    userCoins.splice(IndexsToDel, 1);
    index = document.getElementById(`#myCheck${coin.id}`);
    index.checked = !index.checked;
  });

  userCoins.push(saveNewCoin);
  console.log('FinalSelcted', userCoins);
  $('#modalcontent').modal('hide');
};
