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
    //this.select_channel({id: 2, password: ''});
    const invite =  {
      channel: {
        id: 4,
      },
      invited_user: {
        id: 1,
      }
    }
    this.socket.emit('channel_invitation', invite);
    /*const up_chan = {
      id: 1,
      admins_id: [10],
    }
    this.socket.emit('update_channel', up_chan);*/
    
     /*const message = {
       channel: {
         id: 2,
       },
       content: 'hello'
     }
    this.socket.emit('send_message', message)
    this.content = '';*/
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
    channels.avalaible_channels.forEach(channel => {
      this.receivedChannel(channel)
     })
     console.log(this.channels);
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