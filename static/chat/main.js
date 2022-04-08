const app = new Vue({
  el: '#app',
  data: {
   title: 'Nestjs Websockets Chat',
   content: '',
   channels: [],
   messages: ['1', '2'],
   current_channel: '',
   new_channel_type: '',
   new_channel_password: '',
   socket: null
  },
  methods: {
  
  createChannel() {
    const message = {
      password: this.new_channel_password,
      status: this.new_channel_type,
      members: []
    }
    this.socket.emit('create_channel', message);
    this.new_channel_password = '';
    this.new_channel_type = '';
  }, 

  select_channel(channel) {
    channel.password = this.new_channel_password;
    this.socket.emit('request_channel', channel);
  },

  deleteChannel(channel) {
    this.socket.emit('delete_channel', channel);
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

 pushMessage(message) {
   this.messages.push(message);
 }, 
  created() {
   this.socket = io('http://localhost:3000')
   this.socket.on('receive_message', (message) => {
    this.receivedMessage(message)
   });
   this.socket.on('channel_created', (channel) => {
   this.receivedMessage(channel);
  });
   this.socket.on('get_all_channels', (channels) => {
    channels.forEach(channel => {
      this.receivedChannel(channel)
     })
  });
  this.socket.on('get_channel', (channel) => {
    this.current_channel = channel;
    console.log('ok');
    channel.messages.forEach(message => {
      app.messages.push.message;
    })
  }) 
  },
})