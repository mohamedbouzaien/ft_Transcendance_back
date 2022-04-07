const app = new Vue({
  el: '#app',
  data: {
   title: 'Nestjs Websockets Chat',
   content: '',
   channels: [],
   current_channel: '',
   socket: null
  },
  methods: {
  
  createChannel() {
    const message = {
      password: '',
      members: []
    }
    this.socket.emit('create_channel', message);
  }, 

  select_channel(channel) {
    this.current_channel = channel;
    console.log(this.current_channel);
  },

  sendMessage() {
    if(this.validateInput()) {
     const message = {
       channel: this.current_channel,
       content: this.content
    }
    this.socket.emit('send_message', message)
    this.content = ''
   }
  },
  receivedMessage(message) {
    chan_id = message.channel.id;
    this.channels.forEach((channel) => {
      if (channel.id === chan_id) {
        channel.push(message);
      }
    })
  },
  receivedChannel(channel) {
    this.channels.push(channel);
  },
  validateInput() {
   return this.content.length > 0
  }
 },
  created() {
   this.socket = io('http://localhost:3000')
   this.socket.on('receive_message', (message) => {
     console.log(message);
    this.receivedMessage(message)
   });
   this.socket.on('channel_created', (channel) => {
     console.log('created');
   this.receivedMessage(channel);
  });
   this.socket.on('get_all_channels', (channels) => {
    console.log(channels)
    channels.forEach(channel => {
      this.receivedChannel(channel)
     })
  })
  },
})