const app = new Vue({
  el: '#app',
  data: {
   title: 'Nestjs Pong',
   content: '',
   channels: [],
   messages: [],
   current_channel: '',
   new_channel_type: '',
   new_channel_password: null,
   socket: null
  },
  created() {
    console.log('lol');
    this.socket = io('http://localhost:3000/pong');
    this.socket.on('joinedRoom', (ret) => console.log(ret));
  },
  methods: {  
    findMatch() {
      console.log('ok');
      this.socket.emit('findMatch', (ret ) => {console.log(ret)});
    },
}
})