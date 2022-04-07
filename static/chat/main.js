const app = new Vue({
  el: '#app',
  data: {
   title: 'Nestjs Websockets Chat',
   content: '',
   messages: [],
   socket: null
  },
  methods: {
  
  createChannel() {
    const message = {
      status: 'private',
      password: '',
      members: []
    }
    this.socket.emit('create_channel', message);
  }, 
  sendMessage() {
    if(this.validateInput()) {
     const message = {
     content: this.content
    }
    this.socket.emit('send_message', this.content)
    this.content = ''
   }
  },
  receivedMessage(message) {
   this.messages.push(message)
  },
  validateInput() {
   return this.content.length > 0
  }
 },
  created() {
   this.socket = io('http://localhost:3000')
   this.socket.on('send_all_messages', (messages) => {
     console.log('lol')
    messages.forEach(message => {
     this.receivedMessage(message)
    })});
   this.socket.on('receive_message', (message) => {
     console.log(message);
    this.receivedMessage(message)
   })
   this.socket.on('send_all_user_channels', (message) => {
    console.log(message)
  })
  },
})