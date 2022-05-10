const app = new Vue({
  el: '#app',
  data: {
   title: 'Nestjs Websockets Chat',
   content: '',
   channels: [],
   messages: [],
   current_channel: '',
   new_channel_type: '',
   new_channel_password: null,
   socket: null
  },
  methods: {
  
  createChannel() {
    const message = {
      name: 'jeune',
      password: this.new_channel_password,
      status: this.new_channel_type,
    }
    this.socket.emit('create_channel', message);
    this.new_channel_password = null;
    this.new_channel_type = '';
  }, 

  select_channel() {
    let channel = {
      id: this.content,
      password: this.new_channel_password,
    };
    this.socket.emit('request_channel', channel,  elem => console.log(elem));
  },

  join_channel() {
    let channel = {
      id: this.content,
      password: this.new_channel_password,
    };
    this.socket.emit('join_channel', channel, elem => console.log(elem));
  },

  deleteChannel(channel) {
    const id = this.content;
    this.socket.emit('delete_channel', channel);
  },

  updateChannel() {
    var url = "http://localhost:3000/api/channels/30";

    var xhr = new XMLHttpRequest();
    xhr.open("PATCH", url);
    
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onreadystatechange = function () {
       if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
       }};
    
    var data = `{
      "id": "30",
      "name": "bgboysclub"
    }`;
    
    xhr.send(data);
    
  },
  leaveChannel() {
    const id = this.content;
    this.socket.emit('leave_channel', {id},  elem => console.log(elem));
  },
  sendMessage() {
    const id = this.content;
    //this.socket.emit('manage_blocked_users', {id: '2'});
    //this.socket.emit('get_direct_messages_channel', {id: '2'});
    //this.socket.emit('send_direct_message', {channelId: 14, content: 'hello'});
    //var d = new Date(); d.setMinutes(d.getMinutes() + 1);
    /*this.socket.emit('manage_channel_user_sanction', {
      id: 16,
      sanction: 'ban',
      end_of_sanction: d,

    });*/
    //this.socket.emit('update_password', {id: 9, old_password: this.new_channel_password, new_password: 'test'});
    /*this.socket.emit('manage_channel_user', {
      id: 51,
      sanction: null,
      end_of_sanction: null
    });*/
    /*this.socket.emit('update_channel', {
      id: '2',
      status: this.new_channel_type,
      name: 'lol',
      password: '',
      new_password: ''
    });*/
    //this.socket.emit('leave_channel', {id});
    //this.join_channel({id});
    //this.deleteChannel({id});
    //this.select_channel({id});
    /*const invite =  {
      invitedId: 2,
      channelId: 21
    }
    this.socket.emit('channel_invitation', invite);*/
    
     /*const message = {
       channelId: 3,
       content: this.content
     }
    this.socket.emit('send_channel_message', message)*/
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
  this.socket.on('error', (message) => {
    console.log(message);
  });
  this.socket.on('need_password_for_channel', (message) => {
    console.log('need_password_for_channel');
  });
  this.socket.on('wrong_password_for_channel', (message) => {
    console.log('wrong_password_for_channel');
  }); 
  this.socket.on('channel_user', data => console.log(data));
  this.socket.on('updated_channel', chan => console.log(chan));
  this.socket.on('channel', chan => console.log(chan));
  this.socket.on('leaved_channel', msg => console.log(msg));
  this.socket.on('blocked_users', msg => console.log(msg));
  this.socket.on('invited_channels', msg => console.log(msg));
  this.socket.on('deleted_channel', msg => console.log(msg));

  },
})