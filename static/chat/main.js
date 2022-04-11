const app = new Vue({
  el: '#app',
  data: {
   title: 'Nestjs Websockets Chat',
   content: '',
   channels: [],
   messages: [],
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
      members: [],
      invited_members: [],
    }
    this.socket.emit('create_channel', message);
    this.new_channel_password = '';
    this.new_channel_type = '';
  }, 

  select_channel(channel) {
    channel.password = this.new_channel_password;
    this.socket.emit('request_channel', channel);
  },

  join_channel(channel) {
    channel.password = this.new_channel_password;
    this.socket.emit('join_channel', channel);
  },

  deleteChannel(channel) {
    this.socket.emit('delete_channel', channel);
  },

  sendMessage() {
     const message = {
       channel: this.current_channel,
       content: this.content
     }
     console.log(message);
    this.socket.emit('send_message', message)
    this.content = '';
  },
  receivedMessage(message) {
    this.messages.push(message)
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
   this.receivedMessage(channel);
  });
   this.socket.on('get_all_channels', (channels) => {
     console.log(channels);
    channels.forEach(channel => {
      this.receivedChannel(channel)
     })
  });
  this.socket.on('get_channel', (channel) => {
    console.log(channel);
    this.current_channel = channel;
    channel.messages.forEach(message => {
      this.receivedMessage(message)
    })
    console.log(this.messages);
  });
  this.socket.on('need_password_for_channel', (message) => {
    console.log('need_password_for_channel');
  }) ;
  this.socket.on('wrong_password_for_channel', (message) => {
    console.log('wrong_password_for_channel');
  })
  },
})