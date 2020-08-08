App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    /*
    首先，我们检查，如果我们使用现代DAPP浏览器或更近的版本MetaMask其中一个ethereum供应商
    被注入window对象。如果是这样，我们将使用它来创建我们的web3对象，
    但是我们还需要使用显式请求访问帐户ethereum.enable()。
     */
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }

    /*
    如果ethereum对象不存在，则检查注入web3实例。如果存在，
    则表明我们使用的是旧版dapp浏览器（例如Mist或旧版的MetaMask）。
    如果是这样，我们获取其提供程序并使用它来创建我们的web3对象。
     */
// Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }

    /*
    如果不存在注入的web3实例，我们将基于本地提供程序创建web3对象。
    （这种后备方式适用于开发环境，但不安全且不适合生产。）
     */
// If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  /*
  现在我们可以通过web3与以太坊进行交互了，我们需要实例化我们的智能合约，
  以便web3知道在哪里可以找到它以及它是如何工作的。
  松露有一个名为的库来帮助您@truffle/contract。它使有关合同的信息与迁移保持同步，
  因此您无需手动更改合同的部署地址。
   */
  initContract: function() {

    /*
    我们首先检索智能合约的工件文件。工件是有关我们合同的信息，例如其部署地址和应用程序二进制接口（ABI）。
    ABI是一个JavaScript对象，定义了如何与合同进行交互，包括其变量，函数及其参数。

      1. 回调中包含工件后，便将它们传递给TruffleContract()。这将创建一个我们可以与之交互的合同实例。
      2. 实例化合同后，我们使用App.web3Provider设置web3时存储的值来设置其web3提供程序。
      3. 然后markAdopted()，如果以前访问过任何宠物，我们都会调用该应用程序的功能。
      我们将其封装在一个单独的函数中，因为我们需要在更改智能合约数据时随时更新UI。
     */
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
