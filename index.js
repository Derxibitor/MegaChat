const loginError = document.querySelector('#loginEr')

const login = document.querySelector('#loginBtn')
const message = document.querySelector('#messageBtn')

const usernameInput = document.querySelector('#username')
const textarea = document.querySelector('#textarea')

const chatContainer = document.querySelector('#mega__chat')
const sideBlock = document.querySelector('#side__block')

const modal = document.querySelector('#modal')
const app = document.querySelector('#app')

const userListBox = document.querySelector('#user__list')

let ws

var newDate = new Date();
var datetime = newDate.getHours() + ":" +  newDate.getMinutes();

const socketServerUrl = 'ws://localhost:4000'

const _ReadImage = () => {
  let f = document.querySelector("#file");
  if(f.files && f.files[0]) {
    var reader = new FileReader();
    reader.onload = e => {
      _SaveImage(e.target.result);
    }
    reader.readAsDataURL(f.files[0]);
  }
}
const _SaveImage = img => {
  localStorage.setItem("img", img);
}
const _LoadImage = () => {
  if(localStorage.getItem("img")) {
    document.querySelector("#img").src = localStorage.getItem("img");
  } 
}

login.addEventListener('click', () => {
  loginError.textContent = ''

  if (usernameInput.value === '') {
    loginError.textContent = 'Введите ваше имя'
  } else {
  const reqBody = {
    event: 'login',
    payload: {
      username: usernameInput.value
    }
  }

  modal.classList.add('hide')
  app.classList.remove('hide')

  sideBlock.innerHTML += `
  <div id="profile" class="user__data user__data--profile">
    <img src="userIcon.png" class="user__icon" id="img">
    <div class="text">
      <button class="picture__btn" id="pictureBtn">Поменять фото</button>
      <p class="user__name">${usernameInput.value}</p>
      <button id="logout">Покинуть Чат</button>
    </div>
  </div>
  `
  ws.send(JSON.stringify(reqBody))
  }
})

message.addEventListener('click', () => {
  var image = document.getElementById("img");
  const reqBody = {
    event: 'message',
    payload: {
      username: usernameInput.value,
      message: textarea.value,
      time: datetime,
      picture: image.src
    }
  }

  ws.send(JSON.stringify(reqBody))
})

function start() {
  ws = new WebSocket(socketServerUrl)

  ws.onmessage = (serverResponse) => {
    const { type, payload } = JSON.parse(serverResponse.data)
    const el = JSON.parse(serverResponse.data)

    switch (type) {
      case 'userList':
        userListBox.innerHTML = ''
        for (let i = 0; i < el.payload.length; i++) {
          if (el.payload[i] !== 'undefined') {
            userListBox.innerHTML += `<p>${el.payload[i]}</p>`
          }
        }

        const logoutBtn = document.querySelector('#logout')
        logoutBtn.addEventListener('click', () => {
          modal.classList.remove('hide')
          app.classList.add('hide')
          const profile = document.querySelector('#profile')
          profile.remove()
          const reqBody = {
            event: 'logout',
            payload: {
              username: usernameInput.value,
              userList: el
            }
          }
          
          ws.send(JSON.stringify(reqBody))
        })
        break;

      case 'login':
        chatContainer.innerHTML += `<p>Пользователь ${payload.username} вошел в чат</p>`
        const pictureBtn = document.querySelector('#pictureBtn')
        const submitPic = document.querySelector('#submit--picture')
        const cross = document.querySelector('#cross')
        pictureBtn.addEventListener('click', () => {
          picture__form.classList.remove('hide')
        })
        submitPic.addEventListener('click', () => {
          picture__form.classList.add('hide')
        })
        cross.addEventListener('click', () => {
          picture__form.classList.add('hide')
        })
        break;

      case 'message':
        chatContainer.innerHTML += `
        <div class="user__data chat__profile">
          <img src="${payload.picture}" class="user__icon user__icon--chat">
          <div class="text">
            <p class="user__name">${payload.username}<p>
            <p class="user__name">${payload.message}<p>
            <p class="user__name">${payload.time}<p>
          </div>
        </div>
      `
        break;
    
      case 'logout':
        chatContainer.innerHTML += `<p>${payload.username} вышел из чата</p>`
        break;
    
      default:
        break;
    }
  }
}

start()