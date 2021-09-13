//elements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");
//templates

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();
const autoScroll=()=>{
const $newMessage=$messages.lastElementChild // new message element
//height of new message
const newMessageStyles=getComputedStyle($newMessage) // getting new message margin
const newMessageMargin=parseInt(newMessageStyles.marginBottom)
const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
// visible height
const visibleHeight=$messages.offsetHeight

// height of messages container
const containerHeight=$messages.scrollHeight
// How far have I scrolled
const scrollOffSet=$messages.scrollTop+visibleHeight

if(containerHeight-newMessageHeight<=scrollOffSet)
{
  $messages.scrollTop=$messages.scrollHeight
}


}

socket.on("message", ({ username,text, createdAt }) => {

  const html = Mustache.render(messageTemplate, {username,
    message: text,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();

});
socket.on("locationMessage", ({username, url, createdAt }) => {
  const html = Mustache.render(locationTemplate, {username,
    locationUrl: url,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});
// document.querySelector('#increment').addEventListener('click',()=>{
//     socket.emit('increment',()=>{

//     })
// })
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = document.getElementById("message").value;
  socket.emit("sendMessage", {message,username}, (error) => {
    if (error) {
      alert(error);
    }
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
  });
});
$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location delivered");
        $sendLocationButton.removeAttribute("disabled");
      }
    );
  });
});


socket.emit('join',{username,room},(error)=>{
  if(error)
  {
alert(error)
location.href='/'
  }
})

socket.on('roomData',({users,room})=>{
  const html=Mustache.render(sidebarTemplate,{room,users})
  document.querySelector('#sidebar').innerHTML=html
})
